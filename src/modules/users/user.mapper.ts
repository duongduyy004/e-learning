import { RoleEnum } from "../roles/roles.enum";
import { UserEntity } from "./entities/user.entity";
import { User } from "./user.domain";

export class UserMapper {
    static toDomain(raw: UserEntity): User {
        const domainEntity = new User()
        domainEntity.id = raw.id;
        domainEntity.name = raw.name;
        domainEntity.email = raw.email;
        domainEntity.socialId = raw.socialId;
        domainEntity.provider = raw.provider;
        domainEntity.isEmailVerified = raw.isEmailVerified;
        if (raw.role) {
            domainEntity.role = {
                id: raw.role.id,
                name: RoleEnum[raw.role.id],
                isActive: raw.role.isActive,
                description: raw.role.description
            }
        }

        return domainEntity
    }
}