import { UserEntity } from 'modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationObjectEntity } from './notification-object.entity';

@Entity('notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserEntity)
  notifier: UserEntity;

  @ManyToOne(() => NotificationObjectEntity, (obj) => obj.notification, {
    cascade: true,
  })
  object: NotificationObjectEntity;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
