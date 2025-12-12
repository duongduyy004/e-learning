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
import { IPaginationOptions } from 'utils/types/pagination-options';
import { FilterNotificationDto } from './dto/filter-notification.dto';
import { MarkAsReadDto } from './dto/mark-read.dto';

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

        const notificationsToSave: NotificationEntity[] = [];

        // 1. Notify the target entity (e.g., the user being followed)
        if (createNotificationDto.entityTypeId === ENTITY_TYPE.FOLLOW.id) {
          notificationsToSave.push(
            manager.create(NotificationEntity, {
              notifier: { id: createNotificationDto.entityId },
              object: { id: newNotificationObject.id },
              isRead: false,
            }),
          );
        }

        // 2. Notify the followers of the actor
        if (followers.length > 0) {
          const followerNotifications = followers.map((item) =>
            manager.create(NotificationEntity, {
              notifier: { id: item.follower.id },
              object: { id: newNotificationObject.id },
              isRead: false,
            }),
          );
          notificationsToSave.push(...followerNotifications);
        }
        if (notificationsToSave.length === 0) {
          return;
        }

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

    const { savedNotifications, newNotificationObject } = transactionResult;

    // Get Entity Data
    const entityData = await this.getEntityData(
      newNotificationObject.entityTypeId,
      newNotificationObject.entityId,
    );
    const { actor, ...notification } = newNotificationObject;
    const sender = await this.userRepository.findOne({
      where: { id: user.id },
    });
    const notificationPayload = {
      ...notification,
      actor: { name: sender.name, avatar: sender.avatar },
      notificationData: entityData,
    };

    // 5. Send Real-time Notification
    Array.isArray(savedNotifications)
      ? savedNotifications.forEach((notification) => {
          if (notification.notifier) {
            this.notificationsGateway.sendNotification(
              notification.notifier.id,
              {
                ...notificationPayload,
                isRead: notification?.isRead || false,
                createdAt: notification?.createdAt,
              },
            );
          }
        })
      : this.notificationsGateway.sendNotification(
          savedNotifications.notifier.id,
          {
            ...notificationPayload,
            isRead: savedNotifications[0]?.isRead || false,
            createdAt: savedNotifications[0]?.createdAt,
          },
        );

    return savedNotifications;
  }

  async getNotifications(
    userId: number,
    {
      paginationOptions,
      filterOptions,
    }: {
      filterOptions?: FilterNotificationDto;
      paginationOptions: IPaginationOptions;
    },
  ) {
    const qb = this.notificationRepository
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
    const totalPage = Math.ceil(total / paginationOptions.limit);

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
          actor: {
            name: object?.actor?.name || 'Deleted User',
            avatar: object?.actor?.avatar || null,
          },
          notificationData: entityData,
        };

        return notificationPayload;
      }),
    );

    return {
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPage,
        totalItems,
      },
      items: mapDataItems,
    };
  }

  async markAsRead(ids: number | number[]) {
    const notificationIds = Array.isArray(ids) ? ids : [ids];
    return await this.notificationRepository.update(
      { id: In(notificationIds) },
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
