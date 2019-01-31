import ts from 'typescript';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token, TokenProperties } from './token';
import { Omit } from '../../../utils/types';

export interface TypeScriptTokenizerOptions {
  fileName: string;
  preambleCode?: string;
  languageService: ts.LanguageService;
}

export interface TypeScriptTokenProperties extends TokenProperties<'ts', ts.ClassificationTypeNames> {
  sourcePosition: number;
}

export type TypeScriptTokenType = ts.ClassificationTypeNames;
export type TypeScriptToken = Token<'ts', ts.ClassificationTypeNames> & TypeScriptTokenProperties;

export function TypeScriptToken({
  sourcePosition,
  ...tokenProperties
}: Omit<TypeScriptTokenProperties, 'type'>): TypeScriptToken {
  return {
    ...Token({ ...tokenProperties, type: 'ts' }),
    sourcePosition,
  };
}

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<TypeScriptToken> {
  return {
    tokenizeDocument: fullText => {
      const { fileName, languageService } = options;
      const preambleCode = options.preambleCode || '';
      const lines = fullText.split('\n');

      const visibleSpan = { start: preambleCode.length, length: fullText.length };
      const syntacticClassifications = languageService.getSyntacticClassifications(fileName, visibleSpan);
      return lines.reduce(({ consumedLength, tokens }, line, index) => {
        const newConsumedLength = consumedLength + line.length + 1; // Add one for '\n' removed in split
        tokens[index] = { hash: '', tokens: [] };
        while (
          syntacticClassifications.length
          && syntacticClassifications[0].textSpan.start < newConsumedLength
        ) {
          const { textSpan, classificationType } = syntacticClassifications.shift()!;
          if (!isIdentifierClassification(classificationType)) {
            continue;
          }

          const token = TypeScriptToken({
            scopes: [classificationType],
            start: textSpan.start - consumedLength,
            end: textSpan.start + textSpan.length - consumedLength,
            sourcePosition: textSpan.start,
          });
          tokens[index].tokens.push(token);
          tokens[index].hash += token.hash;
        }

        return { consumedLength: newConsumedLength, tokens };
      }, {
        consumedLength: preambleCode.length,
        tokens: [] as CacheableLineTokens<TypeScriptToken>[],
      }).tokens;
    },
  };
}

const identifierClassifications = new Set([
  ts.ClassificationTypeNames.className,
  ts.ClassificationTypeNames.enumName,
  ts.ClassificationTypeNames.identifier,
  ts.ClassificationTypeNames.interfaceName,
  ts.ClassificationTypeNames.parameterName,
  ts.ClassificationTypeNames.typeAliasName,
  ts.ClassificationTypeNames.typeParameterName,
]);

export function isIdentifierClassification(classification: ts.ClassificationTypeNames) {
  return identifierClassifications.has(classification);
}
