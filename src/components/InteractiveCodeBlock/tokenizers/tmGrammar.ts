import { IGrammar } from 'vscode-textmate';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token } from './token';

export interface TmGrammarTokenizerOptions {
  grammar: IGrammar;
}

export function createTmGrammarTokenizer(options: TmGrammarTokenizerOptions): Tokenizer<Token<'tm', string>> {
  return {
    tokenize: (fullText, lineIndex) => {
      const { grammar } = options;
      const lines = fullText.split('\n');
      return grammar.tokenizeLine(lines[lineIndex], undefined as any)
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
