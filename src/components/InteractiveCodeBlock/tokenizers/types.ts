import { Token } from './token';

export interface CacheableLineTokens<T extends Token<string, string>> {
  hash: string;
  tokens: T[];
}

export interface Tokenizer<TokenT extends Token<string, string>> {
  tokenize: (fullText: string, lineIndex: number) => CacheableLineTokens<TokenT>;
}
