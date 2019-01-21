import { Token } from './token';

export interface Tokenizer<T extends string> {
  tokenTypes: T[];
  tokenize: (text: string) => Token<T>[];
}
