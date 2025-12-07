import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResultDto {
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  isLearned: boolean;
}
