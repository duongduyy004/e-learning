import { WordEntity } from "modules/words/entities/word.entity";
import { Column, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestionChoiceEntity } from "./question-choice.entity";

@Entity('question')
export class QuestionEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @OneToOne(() => WordEntity, word => word.question, { cascade: ['insert'], onDelete: 'CASCADE' })
    @JoinColumn()
    word: WordEntity

    @Column()
    order: number

    @OneToMany(() => QuestionChoiceEntity, choices => choices.question, { cascade: true, })
    choices: QuestionChoiceEntity[]
}