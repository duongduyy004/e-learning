import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateResultDetailDto {
  @Transform((value) => parseInt(value.value))
  @IsNumber()
  @IsNotEmpty()
  questionId: number;

  @Transform((value) => parseInt(value.value))
  @IsNumber()
  @IsNotEmpty()
  answerId: number;
}
