import { Token } from './token';

export interface CacheableLineTokens<T extends Token<string>> {
  hash: string;
  tokens: T[];
}

export interface Tokenizer<TokenT extends Token<string>> {
  tokenize: (fullText: string, lineIndex: number) => CacheableLineTokens<TokenT>;
}
