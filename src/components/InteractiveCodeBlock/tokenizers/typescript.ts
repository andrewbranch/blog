import ts from 'typescript';
import {
  Tokenizer,
  CacheableLineTokens,
  TypeScriptTokenProperties,
  TypeScriptTokenType,
  TypeScriptDiagnosticTokenType,
  TypeScriptTokenizerOptions,
} from './types';
import { Token } from './token';
import { Omit } from '../../../utils/types';

export type TypeScriptIdentifierToken = Token<
  TypeScriptTokenType.Identifier,
  import('typescript').ClassificationTypeNames
> & TypeScriptTokenProperties<import('typescript').ClassificationTypeNames>;
export type TypeScriptDiagnosticToken = Token<
  TypeScriptTokenType.Diagnostic,
  TypeScriptDiagnosticTokenType
> & TypeScriptDiagnosticTokenProperties;

export interface TypeScriptDiagnosticTokenProperties extends TypeScriptTokenProperties<TypeScriptDiagnosticTokenType> {
  diagnosticMessage: string;
}

export type TypeScriptToken = TypeScriptIdentifierToken | TypeScriptDiagnosticToken;

export function TypeScriptIdentifierToken({
  sourcePosition,
  ...tokenProperties
}: Omit<TypeScriptTokenProperties<ts.ClassificationTypeNames>, 'type'>): TypeScriptIdentifierToken {
  return {
    ...Token({ ...tokenProperties, type: TypeScriptTokenType.Identifier }),
    sourcePosition,
  };
}

export function TypeScriptDiagnosticToken({
  sourcePosition,
  diagnosticMessage,
  ...tokenProperties
}: Omit<TypeScriptDiagnosticTokenProperties, 'type'>): TypeScriptDiagnosticToken {
  return {
    ...Token({ ...tokenProperties, type: TypeScriptTokenType.Diagnostic }),
    sourcePosition,
    diagnosticMessage,
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
      const syntacticDiagnostics = languageService.getSyntacticDiagnostics(fileName);
      const semanticDiagnostics = languageService.getSemanticDiagnostics(fileName);
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

          const token = TypeScriptIdentifierToken({
            scopes: [classificationType],
            start: textSpan.start - consumedLength,
            end: textSpan.start + textSpan.length - consumedLength,
            sourcePosition: textSpan.start,
          });
          tokens[index].tokens.push(token);
          tokens[index].hash += `!${token.hash}`;
        }

        while (
          syntacticDiagnostics.length
          && syntacticDiagnostics[0].start < newConsumedLength
        ) {
          const { start, length, messageText } = syntacticDiagnostics.shift()!;
          const end = Math.min(start + length - consumedLength, line.length);
          const token = TypeScriptDiagnosticToken({
            scopes: [TypeScriptDiagnosticTokenType.Syntactic],
            diagnosticMessage: ts.flattenDiagnosticMessageText(messageText, '\n'),
            sourcePosition: start,
            start: start - consumedLength,
            end,
          });
          tokens[index].tokens.push(token);
          tokens[index].hash += `!${token.hash}`;
        }

        while (
          semanticDiagnostics.length
          && semanticDiagnostics[0].start
          && semanticDiagnostics[0].start < newConsumedLength
        ) {
          const { start, length, messageText } = semanticDiagnostics.shift()!;
          const end = Math.min(start! + length! - consumedLength, line.length);
          const token = TypeScriptDiagnosticToken({
            scopes: [TypeScriptDiagnosticTokenType.Semantic],
            diagnosticMessage: ts.flattenDiagnosticMessageText(messageText, '\n'),
            sourcePosition: start!,
            start: start! - consumedLength,
            end,
          });
          tokens[index].tokens.push(token);
          tokens[index].hash += `!${token.hash}`;
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
