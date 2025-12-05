import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationObjectEntity } from './entities/notification-object.entity';
import { RelationshipEntity } from 'modules/users/entities/relationship.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationObjectEntity,
      RelationshipEntity
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule { }
