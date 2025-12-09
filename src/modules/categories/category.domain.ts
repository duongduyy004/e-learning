import { Word } from "modules/words/word.domain";

export class Category {
    id: number;

    title: string;

    isPublic: boolean;

    words?: Partial<Word>[]

    deletedAt: Date
}