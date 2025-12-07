import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationObjectEntity } from './entities/notification-object.entity';
import { RelationshipEntity } from 'modules/users/entities/relationship.entity';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'modules/users/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationObjectEntity,
      RelationshipEntity,
      UserEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, JwtService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
