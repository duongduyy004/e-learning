import { Category } from "./category.domain";
import { CategoryEntity } from "./entities/category.entity";

export class CategoryMapper {
    static toDomain(raw: CategoryEntity) {
        const domainEntity = new Category();

        domainEntity.id = raw.id;
        domainEntity.title = raw.title;
        if (raw.words) {
            domainEntity.words = raw.words.map(item => ({
                id: item.id,
                content: item.content,
                meaning: item.meaning
            }))
        }
        return domainEntity;
    }
}