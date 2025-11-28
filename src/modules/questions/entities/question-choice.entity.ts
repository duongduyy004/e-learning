import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuestionEntity } from "./question.entity";

@Entity('question-choice')
export class QuestionChoiceEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    content: string;

    @Column({ default: false })
    isCorrect: boolean;

    @ManyToOne(() => QuestionEntity, question => question.choices)
    question: QuestionEntity
}