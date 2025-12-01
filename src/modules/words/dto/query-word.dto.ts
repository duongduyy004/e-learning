import { IsArray, IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Word } from "../word.domain";
import { Transform } from "class-transformer";

export class FilterWordDto {
    @IsOptional()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    meaning: string;

    @IsOptional()
    isLearned?: boolean;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(id => parseInt(id, 10));
        }
        return value;
    })
    @IsArray()
    @IsInt({ each: true })
    categoryIds?: number[];
}

export class SortWordDto {
    orderBy: keyof Word;
    order: 'ASC' | 'DESC';
}