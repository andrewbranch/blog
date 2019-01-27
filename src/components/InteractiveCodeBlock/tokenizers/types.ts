import { Token } from './token';

export interface CacheableLineTokens<T extends Token<string, string>> {
  hash: string;
  tokens: T[];
}

export interface Tokenizer<TokenT extends Token<string, string>> {
  tokenizeDocument?: (fullText: string) => CacheableLineTokens<TokenT>[];
  tokenizeLine?: (lineText: string) => CacheableLineTokens<TokenT>;
}
