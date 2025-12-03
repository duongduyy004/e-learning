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
import { UpdateResultDetailDto } from './dto/update-result-detail.dto';
import { QueryDto } from 'utils/types/query.dto';
import { ResumeLearningDto } from './dto/resume-learning.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) { }

  @Post()
  createResult(
    @UserInfo() user: User,
    @Body() createResultDto: CreateResultDto,
  ) {
    return this.resultsService.createResult(user, createResultDto);
  }

  @Patch('detail')
  updateResultDetail(
    @UserInfo() user: User,
    @Body() updateResultDetailDto: UpdateResultDetailDto,
  ) {
    return this.resultsService.updateResultDetail(user, updateResultDetailDto);
  }
  @Get()
  getAllResults(@UserInfo() user: User) {
    return this.resultsService.getResults(user.id, { limit: 10, page: 1 });
  }

  @Get(':categoryId')
  getCategoryResults(
    @UserInfo() user: User,
    @Param('categoryId') categoryId: string,
  ) {
    return this.resultsService.getResults(
      user.id,
      { limit: 10, page: 1 },
      +categoryId,
    );
  }

  @Get('detail/:id')
  getResultById(@UserInfo() user: User, @Param('id') id: string) {
    return this.resultsService.getResultById(user, +id);
  }

  @Patch(':resultId')
  confirmResult(@UserInfo() user: User, @Param('resultId') resultId: number) {
    return this.resultsService.confirmResult(user, resultId);
  }
}
