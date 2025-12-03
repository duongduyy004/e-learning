import { Category } from 'modules/categories/category.domain';

export class Word {
  id: number;

  content: string;

  meaning: string;

  category: Partial<Category>;
}
