import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Category } from './category.domain';
import { CategoryMapper } from './category.mapper';
import { FilterCategoryDto, SortCategoryDto } from './dto/quey-category.dto';
import { IPaginationOptions } from 'utils/types/pagination-options';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { WordsService } from 'modules/words/words.service';
import { UserEntity } from 'modules/users/entities/user.entity';
import { User } from 'modules/users/user.domain';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private wordService: WordsService,
    private dataSource: DataSource,
  ) { }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.save(
      this.categoryRepository.create({ title: createCategoryDto.title, isPublic: createCategoryDto.isPublic ?? false }),
    );

    if (createCategoryDto.words && createCategoryDto.words.length > 0)
      await this.wordService.createWords(createCategoryDto.words, category.id);
    return CategoryMapper.toDomain(category);
  }

  async getCategory(id: Category['id']) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { words: { question: { choices: true } } },
    });

    if (!category) return null;

    return CategoryMapper.toDomain(category);
  }

  async getCategories({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCategoryDto;
    sortOptions?: SortCategoryDto[];
    paginationOptions: IPaginationOptions;
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
      relations: { words: { question: { choices: true } } },
      withDeleted: true
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

  async updateCategory(
    id: Category['id'],
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Update category title
    if (updateCategoryDto.title) {
      category.title = updateCategoryDto.title;
    }

    if (updateCategoryDto.isPublic) {
      category.isPublic = updateCategoryDto.isPublic;
    }

    // Add new words
    if (updateCategoryDto.words?.length > 0) {
      await this.wordService.createWords(updateCategoryDto.words, id);
    }

    // Update existing words
    if (updateCategoryDto.updateWords?.length > 0) {
      await this.wordService.updateWords(updateCategoryDto.updateWords);
    }

    // Remove specific words
    if (updateCategoryDto.removeWordIds?.length > 0) {
      await this.wordService.removeWords(updateCategoryDto.removeWordIds);
    }

    await this.categoryRepository.save(category);

    return CategoryMapper.toDomain(category);
  }

  async deleteCategory(id: Category['id']) {
    return this.categoryRepository.softDelete({ id });
  }

  async restoreCategory(id: Category['id']) {
    return this.categoryRepository.restore({ id })
  }

  async addCategoryToUser(userId: number, categoryId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(UserEntity, {
        where: { id: userId },
        relations: ['categories'],
      });

      const category = await manager.findOneBy(CategoryEntity, {
        id: categoryId,
      });

      if (!user || !category) {
        throw new NotFoundException('User or category not found');
      }

      if (user.categories.some((c) => c.id === categoryId)) {
        throw new BadRequestException('Category already added to user');
      }

      // Add category to user
      user.categories.push(category);

      return await manager.save(UserEntity, user);
    });
  }

  async getUserCategories(user: User) {
    const userCates = await this.categoryRepository
      .createQueryBuilder('cate')
      .withDeleted()
      .leftJoin('cate.users', 'cateUser')
      .leftJoin('cate.words', 'words')
      .addSelect('COUNT(words.id)', 'cate_totalWords')
      .where('cate.isPublic = true')
      .orWhere('cateUser.id = :userId', { userId: user.id })
      .groupBy('cate.id')
      .getRawAndEntities();

    // Map the raw count to each entity
    return userCates.entities.map((cate, index) => ({
      ...cate,
      totalWords: parseInt(userCates.raw[index].cate_totalWords) || 0,
    }));
  }
}
