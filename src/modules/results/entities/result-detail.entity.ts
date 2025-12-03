import { QuestionEntity } from 'modules/questions/entities/question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResultEntity } from './result.entity';

@Entity('result_details')
export class ResultDetailEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  user_answer: number;

  @Column({ nullable: true })
  correct_answer: number;

  @ManyToOne(() => ResultEntity, (result) => result.resultDetails)
  @JoinColumn({ name: 'resultId' })
  result: ResultEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity;
}
