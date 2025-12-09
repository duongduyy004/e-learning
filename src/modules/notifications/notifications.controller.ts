import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInfo } from '@/decorator/customize.decorator';
import { User } from '../users/user.domain';
import { QueryDto } from 'utils/types/query.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @UserInfo() user: User,
    @Query() queryDto: QueryDto<any, any>,
  ) {
    return this.notificationsService.getNotifications(user.id, {
      limit: queryDto.limit,
      page: queryDto.page,
    });
  }

  @Post('test')
  createAndSendNotifications(
    @UserInfo() user: User,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.createAndSendNotification(
      user,
      createNotificationDto,
    );
  }

  @Patch('read')
  markAsRead(@Body('ids') ids: number[]) {
    return this.notificationsService.markAsRead(ids);
  }
}
