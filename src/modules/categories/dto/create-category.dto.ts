import { IsBoolean, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CreateWordDto } from 'modules/words/dto/create-word.dto';

export class CreateCategoryDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsBoolean()
    isPublic: boolean;

    @IsOptional()
    @ValidateNested()
    words?: CreateWordDto[]
}