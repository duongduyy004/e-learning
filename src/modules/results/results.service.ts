import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultEntity } from './entities/result.entity';
import { Repository } from 'typeorm';
import { ResultDetailEntity } from './entities/result-detail.entity';
import { User } from 'modules/users/user.domain';
import { CreateResultDto } from './dto/create-result.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { Result } from './result.domain';
import { QuestionEntity } from 'modules/questions/entities/question.entity';
import { WordUserEntity } from 'modules/words/entities/word-user.entity';
import { QuestionChoiceEntity } from 'modules/questions/entities/question-choice.entity';
import { WordsService } from 'modules/words/words.service';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(ResultEntity)
    private resultRepository: Repository<ResultEntity>,
    @InjectRepository(ResultDetailEntity)
    private resultDetailRepository: Repository<ResultDetailEntity>,
    @InjectRepository(QuestionEntity)
    private questionRepository: Repository<QuestionEntity>,
    @InjectRepository(QuestionChoiceEntity)
    private questionChoiceRepository: Repository<QuestionChoiceEntity>,
    private wordsService: WordsService
  ) { }

  async createResult(user: User, createResultDto: CreateResultDto) {
    const { categoryId } = createResultDto;

    const questions = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.word', 'word')
      .where('word.categoryId = :categoryId', { categoryId })
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('wordUser.wordId')
          .from(WordUserEntity, 'wordUser')
          .where('wordUser.userId = :userId', { userId: user.id })
          .andWhere('wordUser.isLearned = true')
          .getQuery();
        return `word.id NOT IN ${subQuery}`;
      })
      .getMany();

    const shuffle = (array: number[]) => {
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];

        return array;
      }
    }

    const result = await this.resultRepository.save(
      this.resultRepository.create({
        user: { id: user.id },
        category: { id: categoryId },
        questionIds: shuffle(questions.map(item => item.id)),
      })
    )

    return result;
  }

  async submitAnswer(resultId: Result['id'], submitResultDto: SubmitAnswerDto) {
    const resultEntity = await this.resultRepository.findOne({
      where: { id: resultId },
      relations: { resultDetails: true, user: true }
    })

    if (!resultEntity) throw new BadRequestException('Result not found')

    const correctAnswer = await this.questionChoiceRepository.findOne({
      where: { question: { id: submitResultDto.questionId }, isCorrect: true },
      relations: { question: { word: true } }
    })

    if (!correctAnswer) throw new BadRequestException('Correct answer not found')

    resultEntity.currentIndex = resultEntity.currentIndex + 1;

    resultEntity.resultDetails.push(
      this.resultDetailRepository.create({
        userAnswerId: submitResultDto.userAnswerId,
        correctAnswerId: correctAnswer.id,
        question: { id: submitResultDto.questionId },
        isCorrect: submitResultDto.userAnswerId === correctAnswer.id
      })
    )

    if (submitResultDto.userAnswerId === correctAnswer.id)
      await this.wordsService.markWordLearned(correctAnswer.question.word.id, resultEntity.user.id)

    return await this.resultRepository.save(resultEntity);
  }

  async getResults(
    userId: User['id'],
    pagination: { limit: number; page: number },
    categoryId?: number,
  ) {

    const [results, total] = await this.resultRepository.findAndCount({
      where: {
        category: { id: categoryId },
        user: { id: userId }
      },
      relations: {
        category: true
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
      result: results.length > 0 ? results : null,
    };
  }

  async getResultById(resultId: number) {
    const result = await this.resultRepository.findOne({
      where: { id: resultId },
      relations: {
        resultDetails: {
          question: {
            word: true,
            choices: true,
          },
        },
        category: true
      },
    });

    if (!result) {
      throw new BadRequestException('Result not found');
    }

    return result;
  }
}
