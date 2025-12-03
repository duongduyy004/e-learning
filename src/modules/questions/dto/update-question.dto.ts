import { IsArray, IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { UpdateChoiceDto } from './update-choice.dto';

export class UpdateQuestionDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsInt()
  order?: number;

  @IsArray({ each: true })
  choices?: UpdateChoiceDto[];
}
