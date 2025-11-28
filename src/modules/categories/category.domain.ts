import { Word } from "modules/words/word.domain";

export class Category {
    id: number;

    title: string;

    words?: Partial<Word>[]
}