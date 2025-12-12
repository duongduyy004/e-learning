import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CategoryService } from './categorys.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './category.domain';
import { QueryDto } from 'utils/types/query.dto';
import { FilterCategoryDto, SortCategoryDto } from './dto/quey-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserInfo } from 'decorator/customize.decorator';
import { User } from 'modules/users/user.domain';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Get('me')
  getUserCategories(@UserInfo() user: User) {
    return this.categoryService.getUserCategories(user);
  }

  @Get(':categoryId')
  get(@Param('categoryId') id: Category['id']) {
    return this.categoryService.getCategory(id);
  }

  @Get()
  getAll(@Query() queryDto: QueryDto<FilterCategoryDto, SortCategoryDto>) {
    return this.categoryService.getCategories({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page,
      },
    });
  }

  @Patch('add-category')
  addCategory(@Body() data: { userId: string; categoryId: string }) {
    return this.categoryService.addCategoryToUser(
      +data.userId,
      +data.categoryId,
    );
  }

  @Patch('restore/:categoryId')
  restore(@Param('categoryId') categoryId: Category['id']) {
    return this.categoryService.restoreCategory(categoryId);
  }

  @Patch(':categoryId')
  update(
    @Param('categoryId') id: Category['id'],
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':categoryId')
  delete(@Param('categoryId') id: Category['id']) {
    return this.categoryService.deleteCategory(id);
  }
}
