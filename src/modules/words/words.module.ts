import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';
import { WordUserEntity } from './entities/word-user.entity';
import { QuestionsModule } from 'modules/questions/questions.module';
import { WordSubscriber } from './word.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([WordEntity, WordUserEntity]),
    QuestionsModule
  ],
  controllers: [WordsController],
  providers: [WordsService, WordSubscriber],
  exports: [WordsService]
})
export class WordsModule { }
