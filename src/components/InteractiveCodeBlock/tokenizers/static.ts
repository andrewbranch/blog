import { CacheableLineTokens, Tokenizer } from './types';
import { Token } from './token';

export function createStaticTokenizer<
  TokenTypeT extends string,
  ScopeNameT extends string,
  TokenT extends Token<TokenTypeT, ScopeNameT>
>(
  tokens: CacheableLineTokens<TokenT>[],
): Tokenizer<TokenT> {
  return {
    tokenizeDocument: () => tokens,
  };
}
