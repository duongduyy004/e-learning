import { WordEntity } from "modules/words/entities/word.entity";
import { Column, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestionChoiceEntity } from "./question-choice.entity";

@Entity('question')
export class QuestionEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @OneToOne(() => WordEntity)
    @JoinColumn()
    word: WordEntity

    @Generated('increment')
    @Column()
    order: number

    @OneToMany(() => QuestionChoiceEntity, choices => choices.question)
    choices: QuestionChoiceEntity[]
}