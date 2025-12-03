import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Public } from 'decorator/customize.decorator';
import { QueryDto } from 'utils/types/query.dto';
import { CheckAnswerDto } from './dto/check-answer.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('check')
  checkAnswer(@Query() checkAnswerDto: CheckAnswerDto) {
    return this.questionsService.checkAnswer(checkAnswerDto);
  }

  @Get(':categoryId')
  getQuestions(
    @Param('categoryId') categoryId: string,
    @Query() queryDto: QueryDto<any, any>,
  ) {
    const { limit, page } = queryDto;
    return this.questionsService.getQuestions(+categoryId, { limit, page });
  }

  @Patch()
  updateQuestions(@Body() updateQuestionDto: UpdateQuestionDto[]) {
    return this.questionsService.updateQuestion(updateQuestionDto);
  }
}
