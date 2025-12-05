import { UserEntity } from "modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NotificationEntity } from "./notification.entity";

@Entity('notification_object')
export class NotificationObjectEntity {
    @PrimaryGeneratedColumn('increment')
    id: string;

    @Column()
    entityTypeId: number;

    @Column()
    entityId: number;

    @OneToMany(() => NotificationEntity, noti => noti.object)
    notification: NotificationEntity[]

    @ManyToOne(() => UserEntity)
    actor: UserEntity
}