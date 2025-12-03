import { IsNotEmpty } from 'class-validator';

export class CreateResultDto {
  @IsNotEmpty()
  categoryId: number;
}
