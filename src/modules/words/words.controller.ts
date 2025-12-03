import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { WordsService } from './words.service';
import { QueryDto } from 'utils/types/query.dto';
import { FilterWordDto, SortWordDto } from './dto/query-word.dto';
import { UserInfo } from 'decorator/customize.decorator';
import { User } from 'modules/users/user.domain';
import { Word } from './word.domain';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  getAll(
    @Query() queryDto: QueryDto<FilterWordDto, SortWordDto>,
    @UserInfo() user: User,
  ) {
    return this.wordsService.getWords(user.id, {
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page,
      },
    });
  }

  @Patch('mark/:wordId')
  markWord(@UserInfo() user: User, @Param('wordId') wordId: Word['id']) {
    return this.wordsService.markWordLearned(wordId, user.id);
  }
}
