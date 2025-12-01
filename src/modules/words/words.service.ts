import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { Category } from 'modules/categories/category.domain';
import { FilterWordDto, SortWordDto } from './dto/query-word.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';
import { Word } from './word.domain';
import { User } from 'modules/users/user.domain';
import { WordUserEntity } from './entities/word-user.entity';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(WordEntity) private wordRepository: Repository<WordEntity>,
        @InjectRepository(WordUserEntity) private wordUserRepository: Repository<WordUserEntity>,
        private dataSource: DataSource
    ) { }

    async createWords(createWordDto: CreateWordDto[], categoryId: Category['id']) {
        const word = await this.wordRepository.save(
            this.wordRepository.create(createWordDto.map(item => ({
                content: item.content,
                meaning: item.meaning,
                category: { id: categoryId }
            }))));

        return word;
    }

    async updateWords(words: { id: number; content: string; meaning: string }[]) {
        const promises = words.map(w =>
            this.wordRepository.update({ id: w.id }, { content: w.content, meaning: w.meaning })
        );
        return Promise.all(promises);
    }


    async removeWords(wordIds: number[]) {
        return this.wordRepository.delete(wordIds);
    }

    async getWords(
        userId: User['id'],
        {
            filterOptions,
            sortOptions,
            paginationOptions
        }: {
            filterOptions?: FilterWordDto,
            sortOptions?: SortWordDto[],
            paginationOptions: IPaginationOptions
        }) {

        const queryBuilder = this.wordRepository
            .createQueryBuilder('word')
            .leftJoinAndSelect('word.category', 'category')
            .leftJoin(
                'word_user',
                'wordUser',
                'wordUser.wordId = word.id AND wordUser.userId = :userId', { userId }
            );

        if (filterOptions?.categoryIds && filterOptions.categoryIds.length > 0) {
            queryBuilder
                .andWhere('category.id IN (:...categoryIds)', { categoryIds: filterOptions.categoryIds })
        }

        if (filterOptions?.content)
            queryBuilder
                .andWhere('word.content ILIKE :value', { value: `%${filterOptions.content}%` });

        if (filterOptions?.meaning)
            queryBuilder
                .andWhere('word.content ILIKE :value', { value: `%${filterOptions.meaning}%` });

        if (filterOptions?.isLearned === true) {
            // Only words that are learned (exist in word_user with isLearned = true)
            queryBuilder.andWhere('wordUser.isLeanred = :isLearned', { isLearned: true });
        } else if (filterOptions?.isLearned === false) {
            // Only words that are NOT learned (don't exist in word_user or isLearned = false)
            queryBuilder.andWhere(
                '(wordUser.wordId IS NULL OR wordUser.isLeanred = :isLearned)',
                { isLearned: false }
            );
        }

        if (sortOptions && sortOptions.length > 0) {
            sortOptions.forEach((sort, index) => {
                if (index === 0) {
                    queryBuilder.orderBy(`word.${sort.orderBy}`, sort.order);
                } else {
                    queryBuilder.addOrderBy(`word.${sort.orderBy}`, sort.order);
                }
            });
        } else {
            queryBuilder.orderBy('word.id', 'DESC');
        }

        const [entities, total] = await queryBuilder
            .skip((paginationOptions.page - 1) * paginationOptions.limit)
            .take(paginationOptions.limit)
            .getManyAndCount();

        const totalItems = total;
        const totalPages = Math.ceil(totalItems / paginationOptions.limit);

        return {
            meta: {
                page: paginationOptions.page,
                limit: paginationOptions.limit,
                totalPages,
                totalItems,
            },
            result: entities
        };
    }


    async markWordLearned(wordId: Word['id'], userId: User['id']) {
        const progress = await this.wordUserRepository.findOne({
            where: {
                wordId, userId
            }
        });

        if (!progress) {
            await this.wordUserRepository.save({
                userId,
                wordId,
                isLeanred: true
            });
        } else if (!progress.isLeanred) {
            progress.isLeanred = true;
            await this.wordUserRepository.save(progress);
        }
        return progress;
    }
}
