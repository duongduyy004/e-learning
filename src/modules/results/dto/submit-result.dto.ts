import { IsNotEmpty } from "class-validator";

export class SubmitResultDto {
    @IsNotEmpty()
    userAnswerId: number;

    @IsNotEmpty()
    correctAnswerId: number;
}