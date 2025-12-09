import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultEntity } from './entities/result.entity';
import { ResultDetailEntity } from './entities/result-detail.entity';
import { QuestionEntity } from 'modules/questions/entities/question.entity';
import { QuestionChoiceEntity } from 'modules/questions/entities/question-choice.entity';
import { WordsModule } from 'modules/words/words.module';
import { NotificationsModule } from 'modules/notifications/notifications.module';
import { ResultSubscriber } from './results.subscriber';
import { CategoryModule } from 'modules/categories/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResultEntity,
      ResultDetailEntity,
      QuestionEntity,
      QuestionChoiceEntity
    ]),
    WordsModule,
    NotificationsModule,
    CategoryModule
  ],
  controllers: [ResultsController],
  providers: [ResultsService, ResultSubscriber],
})
export class ResultsModule { }
