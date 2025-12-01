import { UserEntity } from "modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { WordEntity } from "./word.entity";

@Entity('word_user')
export class WordUserEntity {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    wordId: number;

    @Column()
    isLeanred: boolean;

    @ManyToOne(() => UserEntity, user => user.wordUser, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @ManyToOne(() => WordEntity, word => word.wordUser, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'wordId' })
    word: WordEntity;
}