import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('relationship')
export class RelationshipEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    @ManyToOne(() => UserEntity, user => user.followings, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'followerId' })
    follower: UserEntity;

    @ManyToOne(() => UserEntity, user => user.followers, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'followingId' })
    following: UserEntity;

    @CreateDateColumn()
    createdAt: Date;
}