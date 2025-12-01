import { IsArray, IsOptional, IsString } from "class-validator";
import { CreateWordDto } from "modules/words/dto/create-word.dto";
import { UpdateWordDto } from "modules/words/dto/update-word.dto";

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsArray()
    words?: CreateWordDto[];

    @IsOptional()
    @IsArray()
    updateWords?: UpdateWordDto[]

    @IsOptional()
    @IsArray()
    removeWordIds?: number[];

}