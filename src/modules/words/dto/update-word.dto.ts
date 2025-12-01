import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Word } from "../word.domain";
import { CreateWordDto } from "./create-word.dto";

export class UpdateWordDto extends CreateWordDto {
    @IsNumber()
    @IsNotEmpty()
    id: Word['id'];
}
