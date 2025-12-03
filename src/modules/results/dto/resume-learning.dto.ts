import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ResumeLearningDto {
  @Transform((value) => parseInt(value.value))
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @Transform((value) => parseInt(value.value))
  @IsNumber()
  @IsNotEmpty()
  resultId: number;
}
