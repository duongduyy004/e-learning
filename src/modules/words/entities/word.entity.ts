import { CategoryEntity } from "modules/categories/entities/category.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('word')
export class WordEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    content: string;

    @Column()
    meaning: string;

    @ManyToOne(() => CategoryEntity, cate => cate.words)
    category: CategoryEntity
}