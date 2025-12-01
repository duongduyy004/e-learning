import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WordEntity])],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule { }
