import { QuestionEntity } from 'modules/questions/entities/question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResultEntity } from './result.entity';

@Entity('result_details')
export class ResultDetailEntity {

  @PrimaryColumn()
  resultId: number;

  @PrimaryColumn()
  questionId: string;

  @Column()
  userAnswerId: number;

  @Column()
  correctAnswerId: number;

  @Column()
  isCorrect: boolean;

  @ManyToOne(() => ResultEntity, (result) => result.resultDetails)
  @JoinColumn({ name: 'resultId' })
  result: ResultEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity;
}
