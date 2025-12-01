import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CreateWordDto } from 'modules/words/dto/create-word.dto';

export class CreateCategoryDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @ValidateNested()
    words?: CreateWordDto[]
}