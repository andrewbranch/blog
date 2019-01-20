import Prism from 'prismjs';
import { Token } from './InteractiveCodeBlock';

export enum Grammar {
  TypeScript = 'ts',
}

interface TokenizerOptions {
  grammar: Grammar;
}

interface Tokenizer<T extends string> {
  tokenTypes: T[];
  tokenize: (text: string) => Token<T>[];
}

export enum PrismTokenType {
  Boolean = 'boolean',
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

export function createPrismTokenizer(options: TokenizerOptions): Tokenizer<PrismTokenType> {
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
