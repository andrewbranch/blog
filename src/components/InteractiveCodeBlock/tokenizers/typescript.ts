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

function isIgnoredDiagnostic(diagnostic: ts.Diagnostic) {
  // In example code, it’s useful to show JSX elements alone, which are useless expressions
  return diagnostic.reportsUnnecessary
  // Dynamic import is only supported when '--module' flag is 'commonjs' or 'esNext'.
  // Can’t get this one to go away during static render. Don’t care enough to investigate.
  || diagnostic.code === 1323;
}

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<TypeScriptToken> {
  let subscriber: (() => void) | undefined;
  let timerId: number | undefined;
  let lastText: string | undefined;
  let lastResult: CacheableLineTokens<TypeScriptToken>[] | undefined;

  function tokenizeDocument(fullText: string) {
    const { fileName, languageService } = options;
    const visibleSpan = options.visibleSpan || { start: 0, length: fullText.length };
    const lines = fullText.split('\n');
    const syntacticClassifications = languageService.getSyntacticClassifications(fileName, visibleSpan);
    const syntacticDiagnostics = languageService.getSyntacticDiagnostics(fileName);
    const semanticDiagnostics = languageService.getSemanticDiagnostics(fileName);
    while (syntacticDiagnostics[0] && syntacticDiagnostics[0].start < visibleSpan.start) syntacticDiagnostics.shift();
    while (semanticDiagnostics[0] && (semanticDiagnostics[0].start || 0) < visibleSpan.start) {
      semanticDiagnostics.shift();
    }
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
        const diagnostic = semanticDiagnostics.shift()!;
        const { start, length, messageText } = diagnostic;
        if (isIgnoredDiagnostic(diagnostic)) continue;

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
      consumedLength: visibleSpan.start,
      tokens: [] as CacheableLineTokens<TypeScriptToken>[],
    }).tokens;
  }

  return {
    tokenizeDocument: text => {
      if (!lastResult) {
        lastResult = tokenizeDocument(text);
      } else {
        clearTimeout(timerId);
        if (text !== lastText) {
          timerId = setTimeout(() => {
            lastResult = tokenizeDocument(text);
            if (subscriber) subscriber();
          }, 500);
        }
      }

      lastText = text;
      return lastResult;
    },
    subscribe: onUpdated => {
      subscriber = onUpdated;
    },
    dispose: () => {
      subscriber = undefined;
      lastResult = undefined;
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
  ts.ClassificationTypeNames.jsxOpenTagName,
  ts.ClassificationTypeNames.jsxSelfClosingTagName,
  ts.ClassificationTypeNames.jsxAttribute,
]);

export function isIdentifierClassification(classification: ts.ClassificationTypeNames) {
  return identifierClassifications.has(classification);
}
