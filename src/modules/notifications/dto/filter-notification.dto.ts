import { IsOptional } from 'class-validator';

export class FilterNotificationDto {
  @IsOptional()
  isRead: false;
}

export class SortNotificationDto {
  orderBy: keyof Notification;
  order: 'ASC' | 'DESC';
}
