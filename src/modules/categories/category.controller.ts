import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoryService } from './categorys.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './category.domain';
import { QueryDto } from 'utils/types/query.dto';
import { FilterCategoryDto, SortCategoryDto } from './dto/quey-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly CategoryService: CategoryService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.CategoryService.createCategory(createCategoryDto);
  }

  @Get(':categoryId')
  get(@Param('categoryId') id: Category['id']) {
    return this.CategoryService.getCategory(id)
  }

  @Get()
  getAll(@Query() queryDto: QueryDto<FilterCategoryDto, SortCategoryDto>) {
    return this.CategoryService.getCategories({
      filterOptions: queryDto.filters,
      sortOptions: queryDto.sort,
      paginationOptions: {
        limit: queryDto.limit,
        page: queryDto.page
      }
    })
  }

  @Patch(':categoryId')
  update(
    @Param('categoryId') id: Category['id'],
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.CategoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':categoryId')
  delete(@Param('categoryId') id: Category['id']) {
    return this.CategoryService.softDeleteCategory(id);
  }
}
