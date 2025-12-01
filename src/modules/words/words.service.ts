import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WordEntity } from './entities/word.entity';
import { Repository } from 'typeorm';
import { CreateWordDto } from './dto/create-word.dto';
import { Category } from 'modules/categories/category.domain';
import { FilterWordDto, SortWordDto } from './dto/query-word.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';

@Injectable()
export class WordsService {
    constructor(
        @InjectRepository(WordEntity) private wordRepository: Repository<WordEntity>
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

    async getWords({
        filterOptions,
        sortOptions,
        paginationOptions
    }: {
        filterOptions?: FilterWordDto,
        sortOptions?: SortWordDto[],
        paginationOptions: IPaginationOptions
    }) {

    }
}
