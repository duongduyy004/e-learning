import { User } from "modules/users/user.domain";
import { Word } from "../word.domain";

export class FilterWordDto {
    categoryIds: number[];
    userId: User['id'];
    status: string;
}

export class SortWordDto {
    orderBy: keyof Word;
    order: 'ASC' | 'DESC';
}