import { IGrammar } from 'vscode-textmate';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token } from './token';

export interface TmGrammarTokenizerOptions {
  grammar: IGrammar;
}

export function createTmGrammarTokenizer(options: TmGrammarTokenizerOptions): Tokenizer<Token<'tm', string>> {
  return {
    tokenizeLine: text => {
      const { grammar } = options;
      return grammar.tokenizeLine(text, undefined as any)
        .tokens
        .reduce((container: CacheableLineTokens<any>, tmToken) => {
          const token = Token({
            type: 'tm',
            scopes: tmToken.scopes,
            start: tmToken.startIndex,
            end: tmToken.endIndex,
          });
          return {
            tokens: container.tokens.concat(token),
            hash: container.hash + `:${token.getHash()}`,
          };
        }, { tokens: [], hash: '' });
    },
  };
}
