import { Category } from "modules/categories/category.domain";
import { User } from "modules/users/user.domain";

export class Result {
    id: number;

    user: User;

    category: Category;

    isComplete: boolean;

    startedAt: Date;

    completedAt: Date

    details: {
        userAnswerId: number,
        correctAnswerId: number,
        isCorrect: boolean
    }[]
}