import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { User } from 'modules/users/user.domain';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserEntity } from 'modules/users/entities/user.entity';
import { RelationshipEntity } from 'modules/users/entities/relationship.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(NotificationEntity)
        private notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(RelationshipEntity)
        private relationshipRepository: Repository<RelationshipEntity>
    ) { }

    async saveNotification(createNotificationDto: CreateNotificationDto) {
        try {
            const followers = await this.relationshipRepository.find({
                where: { following: { id: createNotificationDto.actorId } },
                relations: { follower: true }
            })

            const notifications = followers.map(item => (
                this.notificationRepository.create({
                    notifier: { id: item.follower.id },
                    object: {
                        actor: { id: createNotificationDto.actorId },
                        entityId: createNotificationDto.entityId,
                        entityTypeId: createNotificationDto.entityTypeId
                    }
                })
            ))

            await this.notificationRepository.save(notifications);
            return;
        } catch (error) {
            throw new BadRequestException(error.message)
        }

    }

    async sendNotification() {

    }
}
