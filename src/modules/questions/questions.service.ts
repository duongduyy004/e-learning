import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { QuestionChoiceEntity } from './entities/question-choice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { Category } from 'modules/categories/category.domain';
import { CheckAnswerDto } from './dto/check-answer.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,
    @InjectRepository(QuestionChoiceEntity)
    private questionChoiceRepository: Repository<QuestionChoiceEntity>,
  ) { }

  async updateQuestion(updateQUestionDto: UpdateQuestionDto[]) {
    const questions = await this.questionRepository.find({
      where: { id: In(updateQUestionDto.map((item) => item.id)) },
      relations: { choices: true }
    });

    const choicesUpdate = updateQUestionDto.reduce((acc, item) => {
      acc[item.id] = item.choices;
      return acc;
    }, {} as Record<number, UpdateChoiceDto[]>);

    const deleteChoiceIds: number[] = [];

    for (const q of questions) {
      const correctChoice = q.choices.find((item) => item.isCorrect);
      const currentQuestionChoices = choicesUpdate[q.id];

      const incomingIds = new Set(currentQuestionChoices.map((c) => c.id));
      const choicesToDelete = q.choices.filter(
        (choice) =>
          !incomingIds.has(choice.id) && choice.id !== correctChoice.id,
      );

      deleteChoiceIds.push(...choicesToDelete.map((c) => c.id));

      q.choices = currentQuestionChoices.map(
        (item) =>
          item.id !== correctChoice.id && {
            id: item.id,
            content: item.content,
            isCorrect: false,
          },
      );
      q.choices.push({ ...correctChoice, isCorrect: true });
    }

    if (deleteChoiceIds && deleteChoiceIds.length > 0)
      await this.questionChoiceRepository.delete(deleteChoiceIds);

    return await this.questionRepository.save(questions);
  }

  async getQuestions(
    categoryId: Category['id'],
    pagination: { limit: number; page: number },
  ) {
    const [questions, total] = await this.questionRepository.findAndCount({
      where: { word: { category: { id: categoryId } } },
      relations: { word: true, choices: true },
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
    });
    const totalItems = total;
    const totalPages = Math.ceil(totalItems / pagination.limit);

    return {
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        totalItems,
      },
      result: questions,
    };
  }

  async checkAnswer(checkAnswerDto: CheckAnswerDto) {
    const { answerId, questionId } = checkAnswerDto;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: { choices: true },
    });

    if (!question) throw new BadRequestException('Question not found');

    const correctAnswer = question.choices.find((item) => item.isCorrect);

    return {
      isCorrect: answerId === correctAnswer.id,
      correctId: correctAnswer.id,
    };
  }
}
