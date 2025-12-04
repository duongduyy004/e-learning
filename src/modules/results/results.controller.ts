import { CreateResultDto } from './dto/create-result.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { UserInfo } from 'decorator/customize.decorator';
import { User } from 'modules/users/user.domain';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QueryDto } from 'utils/types/query.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) { }

  @Post(':categoryId')
  createResult(
    @UserInfo() user: User,
    @Param() createResultDto: CreateResultDto,
  ) {
    return this.resultsService.createResult(user, createResultDto);
  }

  @Get('detail/:id')
  getResultById(@Param('id') id: string) {
    return this.resultsService.getResultById(+id);
  }

  @Get(':categoryId')
  getCategoryResults(
    @UserInfo() user: User,
    @Param('categoryId') categoryId: string,
    @Query() queryDto: QueryDto<any, any>
  ) {
    return this.resultsService.getResults(
      user.id,
      { limit: queryDto.limit, page: queryDto.page },
      +categoryId,
    );
  }

  @Patch(':resultId')
  submitAnswer(
    @Param('resultId') resultId: number,
    @Body() submitAnswerDto: SubmitAnswerDto
  ) {
    return this.resultsService.submitAnswer(resultId, submitAnswerDto);
  }
}
