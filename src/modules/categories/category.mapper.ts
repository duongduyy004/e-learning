import { Category } from "./category.domain";
import { CategoryEntity } from "./entities/category.entity";

export class CategoryMapper {
    static toDomain(raw: CategoryEntity) {
        const domainEntity = new Category();

        domainEntity.id = raw.id;
        domainEntity.title = raw.title;
        domainEntity.isPublic = raw.isPublic;
        if (raw.words) {
            domainEntity.words = raw.words.map(item => ({
                id: item.id,
                content: item.content,
                meaning: item.meaning,
                restChoices: item.question.choices.filter(item => (!item.isCorrect && {
                    id: item.id,
                    content: item.content,
                    isCorrect: item.isCorrect
                }))
            }))
        }
        domainEntity.deletedAt = raw.deletedAt;
        return domainEntity;
    }
}