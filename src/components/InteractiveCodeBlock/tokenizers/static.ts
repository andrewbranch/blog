import { CacheableLineTokens, Tokenizer } from './types';
import { Token } from './token';

export function createStaticTokenizer(
  tokens: CacheableLineTokens<Token<string, string>>[],
): Tokenizer<Token<string, string>> {
  return {
    tokenizeDocument: () => tokens,
  };
}
