import { UserEntity } from "modules/users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('result')
export class ResultEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => UserEntity)
    user: UserEntity
}