import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultEntity } from './entities/result.entity';
import { ResultDetailEntity } from './entities/result-detail.entity';
import { QuestionEntity } from 'modules/questions/entities/question.entity';
import { QuestionChoiceEntity } from 'modules/questions/entities/question-choice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResultEntity,
      ResultDetailEntity,
      QuestionEntity,
      QuestionChoiceEntity
    ]),
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule { }
