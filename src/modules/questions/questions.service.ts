import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { QuestionChoiceEntity } from './entities/question-choice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { Category } from 'modules/categories/category.domain';

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

  async getQuestion(questionId: number) {
    const question = this.questionRepository.findOne({
      where: { id: questionId },
      relations: { word: true, choices: true }
    })
    if (!question)
      throw new BadRequestException('Question not foud');
    return question;
  }
}
