import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class MarkAsReadDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v));
      }
    }
    return Number(value);
  })
  @IsInt({ each: true })
  notificationIds: number | number[];
}
