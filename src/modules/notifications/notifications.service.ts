import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Repository, DataSource, In } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RelationshipEntity } from 'modules/users/entities/relationship.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationObjectEntity } from './entities/notification-object.entity';
import { ENTITY_TYPE } from './entity.type';
import { UserEntity } from 'modules/users/entities/user.entity';
import { User } from 'modules/users/user.domain';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(RelationshipEntity)
    private relationshipRepository: Repository<RelationshipEntity>,
    @InjectRepository(NotificationObjectEntity)
    private notificationObjectRepository: Repository<NotificationObjectEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private notificationsGateway: NotificationsGateway,
    private dataSource: DataSource,
  ) {}

  async createAndSendNotification(
    user: User,
    createNotificationDto: CreateNotificationDto,
  ) {
    let transactionResult: any;

    try {
      transactionResult = await this.dataSource.transaction(async (manager) => {
        // 1. Create one Notification Object (The event)
        const newNotificationObject = await manager.save(
          manager.create(NotificationObjectEntity, {
            actor: { id: user.id },
            entityId: createNotificationDto.entityId,
            entityTypeId: createNotificationDto.entityTypeId,
          }),
        );

        // 3. Get all followers of the actor
        const followers = await manager.find(RelationshipEntity, {
          where: { following: { id: user.id } },
          relations: ['follower'],
        });

        // No followers to notify
        if (followers.length === 0) {
          if (createNotificationDto.entityTypeId === ENTITY_TYPE.FOLLOW.id) {
            notificationsToSave = manager.create(NotificationEntity, {
              notifier: { id: createNotificationDto.entityId },
              object: { id: newNotificationObject.id },
              isRead: false,
            });
          } else {
            // No follower to notify the result action
            return;
          }
        } else {
          // 4. Create Notification entities
          notificationsToSave = followers.map((item) =>
            manager.create(NotificationEntity, {
              notifier: { id: item.follower.id },
              object: { id: newNotificationObject.id },
              isRead: false,
            }),
          );
        }

        // 4. Create Notification entities
        const notificationsToSave = followers.map((item) =>
          manager.create(NotificationEntity, {
            notifier: { id: item.follower.id },
            object: { id: newNotificationObject.id } as any,
            isRead: false,
          }),
        );

        const savedNotifications = await manager.save(notificationsToSave);

        return {
          savedNotifications,
          newNotificationObject,
        };
      });
    } catch (error) {
      console.error(error);
      throw new UnprocessableEntityException(error.message);
    }

    if (!transactionResult) {
      return [];
    }

    const { savedNotifications, actorData, newNotificationObject } =
      transactionResult;
    // Get Entity Data
    const entityData = await this.getEntityData(
      newNotificationObject.entityTypeId,
      newNotificationObject.entityId,
    );
    const { actor, ...notification } = newNotificationObject;

    const notificationPayload = {
      ...notification,
      actor: { name: user.name, avatar: user.avatar },
      notificationData: entityData,
    };

    // 5. Send Real-time Notification
    savedNotifications.forEach((notification) => {
      if (notification.notifier) {
        this.notificationsGateway.sendNotification(
          notification.notifier.id,
          notificationPayload,
        );
      }
    });

    return savedNotifications;
  }

  async getNotifications(
    userId: number,
    pagination: { limit: number; page: number },
  ) {
    const [items, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.object', 'object')
      .leftJoinAndSelect('object.actor', 'actor')
      .addSelect(['actor.name', 'actor.avatar'])
      .where('notification.notifier.id = :userId', { userId });

    if (filterOptions) {
      qb.andWhere('notification.isRead = :isRead', {
        isRead: filterOptions.isRead,
      });
    }

    const [items, total] = await qb
      .orderBy('notification.createdAt', 'DESC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getManyAndCount();

    const totalItems = total;
    const totalPage = Math.ceil(total / pagination.limit);

    const mapDataItems = await Promise.all(
      items.map(async (item) => {
        const { object, ...itemData } = item;
        const { actor, ...notification } = object;

        const entityData = await this.getEntityData(
          object.entityTypeId,
          object.entityId,
        );

        const notificationPayload = {
          ...notification,
          ...itemData,
          actor: { name: object.actor.name, avatar: object.actor.avatar },
          notificationData: entityData,
        };

        return notificationPayload;
      }),
    );

    return {
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        totalPage,
        totalItems,
      },
      items: mapDataItems,
    };
  }

  async markAsRead(idOrIds: number | number[]) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return await this.notificationRepository.update(
      { id: In(ids) },
      { isRead: true },
    );
  }

  private async getEntityData(entityTypeId: number, entityId: number) {
    // Find the Entity Definition from ENTITY_TYPE
    const entityDef = Object.values(ENTITY_TYPE).find(
      (item) => item.id === entityTypeId,
    );
    if (!entityDef || !entityDef.entityName) {
      return null;
    }

    try {
      const repository = this.dataSource.getRepository(entityDef.entityName);
      const options: any = { where: { id: entityId } };

      if (entityDef.entityName === 'UserEntity') {
        options.select = ['id', 'name', 'avatar'];
        // Disable auto relation role
        options.loadEagerRelations = false;
      }

      if (entityDef.entityName === 'ResultEntity') {
        options.relations = ['category'];
        options.select = ['id', 'isComplete', 'startedAt', 'completedAt'];
      }

      return await repository.findOne(options);
    } catch (error) {
      console.error(
        `Error fetching entity ${entityDef.entityName} with ID ${entityId}`,
        error,
      );
      return null;
    }
  }
}
