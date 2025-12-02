import { CategoryEntity } from "modules/categories/entities/category.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { WordUserEntity } from "./word-user.entity";
import { QuestionEntity } from "modules/questions/entities/question.entity";

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

    @OneToOne(() => QuestionEntity, question => question.word, { cascade: true, onDelete: 'CASCADE' })
    question: QuestionEntity
}