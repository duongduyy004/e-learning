import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @Get(':questionId')
  getQuestionById(
    @Param('questionId') questionId: string
  ) {
    return this.questionsService.getQuestion(+questionId);
  }

  @Patch()
  updateQuestions(@Body() updateQuestionDto: UpdateQuestionDto[]) {
    return this.questionsService.updateQuestion(updateQuestionDto);
  }
}
