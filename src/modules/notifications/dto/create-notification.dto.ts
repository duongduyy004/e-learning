import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @Type(() => Number)
  entityTypeId: number;

  @Type(() => Number)
  entityId: number;
}
