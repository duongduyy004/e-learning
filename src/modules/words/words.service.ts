import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { Category } from 'modules/categories/category.domain';
import { FilterWordDto, SortWordDto } from './dto/query-word.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';
import { Word } from './word.domain';
import { User } from 'modules/users/user.domain';
import { WordUserEntity } from './entities/word-user.entity';
import { QuestionsService } from 'modules/questions/questions.service';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(WordEntity)
    private wordRepository: Repository<WordEntity>,
    @InjectRepository(WordUserEntity)
    private wordUserRepository: Repository<WordUserEntity>,
    private dataSource: DataSource,
    private questionsService: QuestionsService,
  ) { }

  async createWords(
    createWordDto: CreateWordDto[],
    categoryId: Category['id'],
  ) {
    const word = await this.wordRepository.save(
      this.wordRepository.create(
        createWordDto.map((item) => ({
          content: item.content,
          meaning: item.meaning,
          category: { id: categoryId },
          question: {
            choices: item.restChoices
              ? [
                ...item.restChoices.map((item) => ({
                  content: item.content,
                  isCorrect: false,
                })),
                { content: item.meaning, isCorrect: true },
              ]
              : [{ content: item.meaning, isCorrect: true }],
          },
        })),
      ),
    );
    return word;
  }

  async updateWords(words: { id: number; content: string; meaning: string }[]) {
    const wordEntities = await this.wordRepository.find({
      where: { id: In(words.map((item) => item.id)) },
      relations: { question: { choices: true } },
    });

    const updates = wordEntities.map((entity) => {
      const updateData = words.find((w) => w.id === entity.id);
      if (updateData) {
        entity.content = updateData.content;
        entity.meaning = updateData.meaning;
      }
      return entity;
    });

    return await this.wordRepository.save(updates);
  }

  async removeWords(wordIds: number[]) {
    return this.wordRepository.delete(wordIds);
  }

  async getWords(
    userId: User['id'],
    {
      filterOptions,
      sortOptions,
      paginationOptions,
    }: {
      filterOptions?: FilterWordDto;
      sortOptions?: SortWordDto[];
      paginationOptions: IPaginationOptions;
    },
  ) {

    const qb = this.wordRepository.createQueryBuilder('word')
      .leftJoinAndSelect('word.wordUser', 'wordUser', 'wordUser.userId = :userId', { userId })
      .leftJoinAndSelect('word.category', 'category');

    // Example OR conditions
    if (filterOptions?.categoryIds && filterOptions.categoryIds.length > 0) {
      qb.where('word.categoryId IN (:...categoryIds)', { categoryIds: filterOptions.categoryIds });
    }
    if (filterOptions?.content) {
      qb.orWhere('word.content ILIKE :content', { content: `%${filterOptions.content}%` });
    }
    if (filterOptions?.meaning) {
      qb.orWhere('word.meaning ILIKE :meaning', { meaning: `%${filterOptions.meaning}%` });
    }
    if (filterOptions?.isLearned === true) {
      qb.andWhere('wordUser.isLearned = :isLearned', { isLearned: true });
    }
    if (filterOptions?.isLearned === false) {
      qb.andWhere('(wordUser.isLearned = false OR wordUser.userId IS NULL)');
    }
    // Pagination and sorting
    qb.skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    if (sortOptions?.length) {
      sortOptions.forEach(s => {
        qb.addOrderBy(`word.${s.orderBy}`, s.order);
      });
    }

    const [entities, total] = await qb.getManyAndCount();

    const totalItems = total;
    const totalPages = Math.ceil(totalItems / paginationOptions.limit);


    const result = entities.map(word => {
      const { wordUser, ...rest } = word;
      return {
        ...rest,
        isLearned: wordUser?.[0]?.isLearned || false
      };
    });

    return {
      meta: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        totalPages,
        totalItems,
      },
      result
    };
  }

  async markWordLearned(wordId: Word['id'], userId: User['id']) {
    const progress = await this.wordUserRepository.findOne({
      where: {
        wordId,
        userId,
      },
    });

    if (!progress) {
      await this.wordUserRepository.save({
        userId,
        wordId,
        isLearned: true,
      });
    } else if (!progress.isLearned) {
      progress.isLearned = true;
      await this.wordUserRepository.save(progress);
    }
    return progress;
  }
}
