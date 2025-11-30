import { Category } from "modules/categories/category.domain";

export class FilterCategoryDto {
    title?: string;
}

export class SortCategoryDto {
    orderBy: keyof Category;
    order: 'ASC' | 'DESC';
}