import Prism from 'prismjs';
import { Token, TokenProperties } from './token';
import { Tokenizer } from './types';
import { Omit } from '../../../utils/types';
import loadCustomTsLanguage from './prism-typescript';

export enum PrismGrammar {
  TypeScript = 'ts',
}

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
  Type = 'type',
}

export interface PrismTokenizerOptions {
  grammar: PrismGrammar;
}

export interface PrismToken extends Token<'prism', PrismTokenType> {}
export function PrismToken(properties: Omit<TokenProperties<'prism', PrismTokenType>, 'type'>) {
  return Token({ type: 'prism', ...properties });
}

export function createPrismTokenizer(options: PrismTokenizerOptions): Tokenizer<PrismToken> {
  loadCustomTsLanguage(Prism);
  return {
    tokenizeLine: text => {
      const language = Prism.languages[options.grammar];
      if (!language) {
        throw new Error(`Language not found: '${options.grammar}'`);
      }

      let hash = '';
      const syntaxHighlighterTokens: PrismToken[] = [];
      const tokens = Prism.tokenize(text, language);
      let consumedLength = 0;
      for (const token of tokens) {
        if (typeof token === 'string') {
          consumedLength += token.length;
          continue;
        }

        const length: number = (token as any).length;
        const prismToken = PrismToken({
          start: consumedLength,
          end: consumedLength + length,
          scopes: [token.type as PrismTokenType],
        });

        syntaxHighlighterTokens.push(prismToken);
        hash += `:${prismToken.getHash()}`;

        consumedLength += length;
      }

      return { tokens: syntaxHighlighterTokens, hash };
    },
  };
}
