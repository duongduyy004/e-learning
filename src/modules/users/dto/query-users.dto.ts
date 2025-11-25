import { User } from "@/modules/users/user.domain";

export class FilterUsersDto {
    email: string;
    name: string;
}

export class SortUsersDto {
    orderBy: keyof User;
    order: 'ASC' | 'DESC';
}