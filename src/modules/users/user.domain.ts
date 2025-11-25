import { Exclude } from "class-transformer";
import { Role } from "modules/roles/role.domain";

export class User {
    id: number;

    name: string;

    email: string | null

    @Exclude({ toPlainOnly: true })
    password?: string

    gender: string;

    dayOfBirth: Date;

    avatar?: string;

    publicId?: string;

    role: Role;

    createdAt: Date;

    updatedAt: Date;

    deletedAt: Date;
}