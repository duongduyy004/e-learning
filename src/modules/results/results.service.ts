import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultEntity } from './entities/result.entity';
import { Repository } from 'typeorm';
import { ResultDetailEntity } from './entities/result-detail.entity';
import { QuestionEntity } from 'modules/questions/entities/question.entity';
import { User } from 'modules/users/user.domain';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDetailDto } from './dto/update-result-detail.dto';
import { ResumeLearningDto } from './dto/resume-learning.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ResultEntity)
    private resultRepository: Repository<ResultEntity>,
    @InjectRepository(ResultDetailEntity)
    private resultDetailRepository: Repository<ResultDetailEntity>,
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,
  ) { }

  async createResult(user: User, createResultDto: CreateResultDto) {
    const { categoryId } = createResultDto;
    // Find all question from category with categoryId
    const questions = await this.questionRepository.find({
      where: { word: { category: { id: categoryId } } },
      order: { order: 'ASC' },
    });
    // 1. Validate
    if (!questions || questions.length === 0) {
      throw new BadRequestException('No questions found for this category');
    }

    // 2. Create Result
    const result = await this.resultRepository.save({
      user: { id: user.id },
      isComplete: false,
    });

    return result;
  }
  async getResults(
    userId: User['id'],
    pagination: { limit: number; page: number },
    categoryId?: number,
  ) {
    const where: any = { user: { id: userId } };

    if (categoryId) {
      where.resultDetails = {
        question: {
          word: {
            category: { id: categoryId },
          },
        },
      };
    }

    const [results, total] = await this.resultRepository.findAndCount({
      where,
      relations: {
        resultDetails: {
          question: { word: { category: true } },
        },
      },
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
      result: results.length > 0 ? results : 'No result found!',
    };
  }

  async getResultById(user: User, resultId: number) {
    const result = await this.resultRepository.findOne({
      where: { id: resultId, user: { id: user.id } },
      relations: {
        resultDetails: {
          question: {
            word: true,
            choices: true,
          },
        },
      },
    });

    if (!result) {
      throw new BadRequestException('Result not found');
    }

    return result;
  }

  async confirmResult(user: User, resultId: number) {
    const result = await this.resultRepository.findOne({
      where: { id: resultId, user: { id: user.id } },
    });

    if (!result) {
      throw new BadRequestException('Result not found!');
    }

    result.isComplete = true;

    return await this.resultRepository.save(result);
  }

  async updateResultDetail(
    user: User,
    updateResultDetailDto: UpdateResultDetailDto,
  ) {
    const { questionId, answerId } = updateResultDetailDto;

    const resultDetail = await this.resultDetailRepository.findOne({
      where: {
        question: { id: questionId },
        result: {
          user: { id: user.id },
          isComplete: false,
        },
      },
      relations: {
        question: { choices: true },
      },
    });

    if (!resultDetail) {
      throw new BadRequestException(
        'Result detail not found or result is already completed',
      );
    }

    // Check if answer is correct
    const correctChoice = resultDetail.question.choices.find(
      (c) => c.isCorrect,
    );
    const isCorrect = correctChoice && correctChoice.id === answerId;

    resultDetail.user_answer = answerId;
    resultDetail.correct_answer = correctChoice ? correctChoice.id : null;

    return await this.resultDetailRepository.save(resultDetail);
  }
}
