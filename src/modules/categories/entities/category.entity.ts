import { WordEntity } from "modules/words/entities/word.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('category')
export class CategoryEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    title: string;

    @OneToMany(() => WordEntity, words => words.category)
    words: WordEntity[]
}