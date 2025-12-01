import { CategoryEntity } from "modules/categories/entities/category.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { WordUserEntity } from "./word-user.entity";

@Entity('word')
export class WordEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    content: string;

    @Column()
    meaning: string;

    @ManyToOne(() => CategoryEntity, cate => cate.words, { onDelete: 'CASCADE' })
    category: CategoryEntity

    @OneToMany(() => WordUserEntity, wordUser => wordUser.word)
    wordUser: WordUserEntity[]
}