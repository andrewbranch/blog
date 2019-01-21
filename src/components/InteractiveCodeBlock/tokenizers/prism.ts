import Prism from 'prismjs';
import { Tokenizer, Token } from './types';

export enum PrismTokenType {
  Boolean = 'boolean',
  Builtin = 'builtin',
  ClassName = 'class-name',
  Comment = 'comment',
  Constant = 'constant',
  Function = 'function',
  FunctionVariable = 'function-variable',
  Keyword = 'keyword',
  Number = 'number',
  Operator = 'operator',
  Punctuation = 'punctuation',
  RegExp = 'regex',
  String = 'string',
}

export enum PrismGrammar {
  TypeScript = 'ts',
}

export interface PrismTokenizerOptions {
  grammar: PrismGrammar;
}

export function createPrismTokenizer(options: PrismTokenizerOptions): Tokenizer<PrismTokenType> {
  return {
    tokenTypes: Object.values(PrismTokenType),
    tokenize: (text: string) => {
      const language = Prism.languages[options.grammar];
      if (!language) {
        throw new Error(`Language not found: '${options.grammar}'`);
      }

      const syntaxHighlighterTokens: Token<any>[] = [];
      const tokens = Prism.tokenize(text, language);
      let consumedLength = 0;
      for (const token of tokens) {
        if (typeof token === 'string') {
          consumedLength += token.length;
          continue;
        }

        const length: number = (token as any).length;
        syntaxHighlighterTokens.push({
          start: consumedLength,
          end: consumedLength + length,
          type: token.type,
        });

        consumedLength += length;
      }

      return syntaxHighlighterTokens;
    },
  };
}
