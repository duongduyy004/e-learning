import { UserEntity } from 'modules/users/entities/user.entity';
import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResultDetailEntity } from './result-detail.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';

@Entity('result')
export class ResultEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ type: 'int', array: true, nullable: false })
  questionIds: number[]

  @Column({ default: 0 })
  currentIndex: number;

  @Column({ default: false })
  isComplete: boolean;

  @OneToMany(() => ResultDetailEntity, (resultDetails) => resultDetails.result, { cascade: true })
  resultDetails: ResultDetailEntity[];

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @BeforeUpdate()
  updateResultStatus() {
    if (this.currentIndex > this.questionIds.length - 1)
      this.isComplete = true;
  }
}
