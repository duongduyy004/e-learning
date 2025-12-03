import { IsString } from 'class-validator';

export class CreateChoiceDto {
  @IsString()
  content: string;

  @IsString()
  isCorrect: boolean;
}
