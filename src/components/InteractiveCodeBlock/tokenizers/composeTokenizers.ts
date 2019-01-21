import { Tokenizer } from './types';
import sortedIndex from 'lodash.sortedindex';

export function composeTokenizers<T1 extends string, T2 extends string>(
  tokenizer1: Tokenizer<T1>,
  tokenizer2: Tokenizer<T2>,
) {
  const tokenizers = [tokenizer1, tokenizer2];
  return tokenizers.reduce((composed: Tokenizer<T1 | T2>, tokenizer: Tokenizer<T1 | T2>) => ({
    tokenTypes: [...composed.tokenTypes, ...tokenizer.tokenTypes],
    tokenize: (text: string) => {
      const sortedTokens = [...composed.tokenize(text)];
      const starts = sortedTokens.map(token => token.start);
      tokenizer.tokenize(text).forEach(token => {
        const index = sortedIndex(starts, token.start);
        sortedTokens.splice(index, 0, token);
        starts.splice(index, 0, token.start);
      });
      return sortedTokens;
    },
  }), { tokenTypes: [], tokenize: () => [] });
}
