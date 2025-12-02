import { Injectable } from "@nestjs/common";
import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { WordEntity } from "./entities/word.entity";
import { QuestionEntity } from "modules/questions/entities/question.entity";
import { QuestionChoiceEntity } from "modules/questions/entities/question-choice.entity";

@EventSubscriber()
@Injectable()
export class WordSubscriber implements EntitySubscriberInterface {
    constructor(private dataSource: DataSource) {
        dataSource.subscribers.push(this);
    }

    listenTo(): Function | string {
        return WordEntity;
    }

    async afterUpdate(event: UpdateEvent<any>) {
        const { entity, manager } = event;

        if (!entity || !manager) return;

        const oldEntity = event.databaseEntity;
        const meaningChanged = entity.meaning !== oldEntity.meaning;

        if (meaningChanged) {
            const question = await manager.findOne(QuestionEntity, {
                where: { word: { id: entity.id } },
                relations: ['choices']
            })

            const correctChoice = question.choices.find(item => item.isCorrect === true);
            if (correctChoice) {
                correctChoice.content = entity.meaning;
                await manager.save(QuestionChoiceEntity, correctChoice);
            }
        }
    }
}