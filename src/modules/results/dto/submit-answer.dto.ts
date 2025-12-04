import { IsNotEmpty } from "class-validator";

export class SubmitAnswerDto {
    @IsNotEmpty()
    userAnswerId: number;

    @IsNotEmpty()
    questionId: number;
}