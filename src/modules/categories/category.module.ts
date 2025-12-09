import { Module } from '@nestjs/common';
import { CategoryService } from './categorys.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { WordsService } from 'modules/words/words.service';
import { WordsModule } from 'modules/words/words.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    WordsModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService]
})
export class CategoryModule { }