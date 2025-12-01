import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '@/modules/roles/entities/role.entity';
import { AuthProvidersEnum } from 'modules/auth/auth-providers.enum';
import { WordEntity } from 'modules/words/entities/word.entity';
import { RelationshipEntity } from './relationship.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  socialId: string;

  @Column({ default: AuthProvidersEnum.email, nullable: true })
  provider: string;

  @Column({ nullable: true })
  publicId: string;

  @ManyToOne(() => RoleEntity, { eager: true, nullable: true })
  role: RoleEntity;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @ManyToMany(() => WordEntity)
  @JoinTable()
  words: WordEntity[];

  @OneToMany(() => RelationshipEntity, (follow) => follow.following)
  followings: RelationshipEntity[];

  @OneToMany(() => RelationshipEntity, (follow) => follow.follower)
  followers: RelationshipEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
