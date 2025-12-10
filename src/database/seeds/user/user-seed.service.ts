import { RoleEntity } from '@/modules/roles/entities/role.entity';
import { RoleEnum } from '@/modules/roles/roles.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { users } from './data';

const DEFAULT_PASSWORD = 'password123'
@Injectable()
export class UserSeedService {
    constructor(
        @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
    ) { }

    async run() {
        const countSuperAdmin = await this.repository.count({
            where: {
                role: { id: RoleEnum.superadmin },
            },
        });

        if (!countSuperAdmin) {
            await this.repository.save(
                this.repository.create({
                    email: "admin@gmail.com",
                    name: "Super Admin",
                    password: DEFAULT_PASSWORD
                }),
                { listeners: false }
            );
        }

        const countUser = await this.repository.count({
            where: {
                role: { id: RoleEnum.user },
            },
        });

        if (!countUser) {
            await this.repository.save(
                users.map(item => (this.repository.create({
                    email: item.email,
                    name: item.name,
                    password: item.password
                }))),
                { listeners: false }
            );
        }
    }
}
