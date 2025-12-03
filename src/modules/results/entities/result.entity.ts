import { UserEntity } from 'modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResultDetailEntity } from './result-detail.entity';

@Entity('result')
export class ResultEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: false })
  isComplete: boolean;

  @OneToMany(() => ResultDetailEntity, (resultDetails) => resultDetails.result)
  resultDetails: ResultDetailEntity[];
}
