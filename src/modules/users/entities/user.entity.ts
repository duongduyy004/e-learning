import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import { RoleEntity } from "@/modules/roles/entities/role.entity";

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

  @Column()
  gender: string;

  @Column()
  dayOfBirth: Date;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  publicId: string;

  @ManyToOne(() => RoleEntity, { eager: true })
  role: RoleEntity;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
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
