import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultEntity } from './entities/result.entity';
import { Repository } from 'typeorm';
import { ResultDetailEntity } from './entities/result-detail.entity';
import { User } from 'modules/users/user.domain';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDetailDto } from './dto/update-result-detail.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { Result } from './result.domain';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ResultEntity)
    private resultRepository: Repository<ResultEntity>,
    @InjectRepository(ResultDetailEntity)
    private resultDetailRepository: Repository<ResultDetailEntity>,
  ) { }

  async createResult(user: User, createResultDto: CreateResultDto) {
    const { categoryId } = createResultDto;

    const result = await this.resultRepository.save({
      user: { id: user.id },
      category: { id: categoryId },
      isComplete: false,
    });

    return result;
  }

  async submitResult(resultId: Result['id'], submitResultDto: SubmitResultDto[]) {
    const resultEntity = await this.resultRepository.findOne({
      where: { id: resultId },
      relations: { resultDetails: true }
    })

    for (const result of submitResultDto) {
      resultEntity.resultDetails.push(
        this.resultDetailRepository.create({
          userAnswer: result.userAnswerId,
          correctAnswer: result.correctAnswerId,
          isCorrect: result.userAnswerId === result.correctAnswerId
        })
      )
    }

    return await this.resultRepository.save(resultEntity);
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

    resultDetail.userAnswer = answerId;
    resultDetail.correctAnswer = correctChoice ? correctChoice.id : null;

    return await this.resultDetailRepository.save(resultDetail);
  }
}
