import { IGrammar, StackElement } from 'vscode-textmate';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token } from './token';

export interface TmGrammarTokenizerOptions {
  grammar: IGrammar;
}

export type TextMateToken = Token<'tm', string>;

export function createTmGrammarTokenizer(options: TmGrammarTokenizerOptions): Tokenizer<TextMateToken> {
  return {
    tokenizeDocument: text => {
      const { grammar } = options;
      const lines = text.split('\n');
      return lines.reduce(({ stack, cache }, line) => {
        const result = grammar.tokenizeLine(line, stack!);
        return {
          stack: result.ruleStack,
          cache: cache.concat(result.tokens.reduce((container: CacheableLineTokens<any>, tmToken) => {
            const token = Token({
              type: 'tm',
              scopes: tmToken.scopes,
              start: tmToken.startIndex,
              end: tmToken.endIndex,
            });
            return {
              tokens: container.tokens.concat(token),
              hash: container.hash + `:${token.hash}`,
            };
          }, { tokens: [], hash: '' })),
        };
      }, {
        stack: undefined as StackElement | undefined,
        cache: [] as CacheableLineTokens<Token<'tm', string>>[],
      }).cache;
    },
  };
}
