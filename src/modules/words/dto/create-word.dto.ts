import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateChoiceDto } from "modules/questions/dto/create-choice.dto";

export class CreateWordDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    meaning: string;

    @IsString()
    @IsOptional()
    restChoices?: CreateChoiceDto[]
}