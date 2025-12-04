import { UserEntity } from "modules/users/entities/user.entity";
import { WordEntity } from "modules/words/entities/word.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('category')
export class CategoryEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    title: string;

    @Column({ default: false })
    isPublic: boolean

    @OneToMany(() => WordEntity, words => words.category, { onDelete: 'CASCADE' })
    words: WordEntity[]

    @ManyToMany(() => UserEntity, user => user.categories)
    users: UserEntity[]
}