import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Category } from './category.domain';
import { CategoryMapper } from './category.mapper';
import { FilterCategoryDto, SortCategoryDto } from './dto/quey-category.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>
    ) { }

    async createCategory(createCategoryDto: CreateCategoryDto) {
        const category = await this.categoryRepository.save(
            this.categoryRepository.create(createCategoryDto)
        )
        return CategoryMapper.toDomain(category);
    }

    async getCategory(id: Category['id']) {
        const category = await this.categoryRepository.findOne({
            where: { id }
        })
        return CategoryMapper.toDomain(category);
    }

    async getCategories({
        filterOptions,
        sortOptions,
        paginationOptions
    }:
        {
            filterOptions?: FilterCategoryDto,
            sortOptions?: SortCategoryDto[],
            paginationOptions: IPaginationOptions
        }) {
        const where: FindOptionsWhere<CategoryEntity> = {};

        if (filterOptions?.title) {
            where.title = ILike(`%${filterOptions.title}%`);
        }

        const [entities, total] = await this.categoryRepository.findAndCount({
            skip: (paginationOptions.page - 1) * paginationOptions.limit,
            take: paginationOptions.limit,
            where,
            order: sortOptions?.reduce(
                (acc, s) => ({ ...acc, [s.orderBy]: s.order }),
                {},
            ),
        });

        const totalItems = total;
        const totalPages = Math.ceil(totalItems / paginationOptions.limit);

        return {
            meta: {
                page: paginationOptions.page,
                limit: paginationOptions.limit,
                totalPages,
                totalItems,
            },
            result: entities.map(CategoryMapper.toDomain),
        };
    }

    async updateCategory(id: Category['id'], updateCategoryDto: UpdateCategoryDto) {
        return this.categoryRepository.update({ id }, updateCategoryDto)
    }

    async softDeleteCategory(id: Category['id']) {
        return this.categoryRepository.softDelete({ id })
    }

}
