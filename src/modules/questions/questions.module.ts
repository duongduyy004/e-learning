import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';
import { QuestionChoiceEntity } from './entities/question-choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity, QuestionChoiceEntity])],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService]
})
export class QuestionsModule { }
