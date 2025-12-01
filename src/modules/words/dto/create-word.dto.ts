import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWordDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    meaning: string;
}