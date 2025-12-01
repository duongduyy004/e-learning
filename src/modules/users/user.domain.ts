import { Exclude } from "class-transformer";
import { Category } from "modules/categories/category.domain";
import { Role } from "modules/roles/role.domain";

export class User {
    id: number;

    name: string;

    email: string | null

    @Exclude({ toPlainOnly: true })
    password?: string

    avatar?: string;

    publicId?: string;

    socialId: string;

    provider: string;

    role: Role;

    isEmailVerified: boolean;

    categories: Category[]

    createdAt: Date;

    updatedAt: Date;

    deletedAt: Date;
}