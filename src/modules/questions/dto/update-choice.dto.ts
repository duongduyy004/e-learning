import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateChoiceDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsString()
  content: string;
}
