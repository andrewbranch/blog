import ts from 'typescript';
import memoize from 'memoizee';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token, TokenProperties } from './token';
import sortedIndex from 'lodash.sortedindex';
// import { createNodeWalker } from '../../../utils/typescript';

export interface TypeScriptTokenizerOptions {
  fileName: string;
  preambleCode?: string;
  languageService: ts.LanguageService;
}

export interface TypeScriptTokenProperties extends TokenProperties<ts.ClassificationTypeNames> {
  sourcePosition: number;
  isCallLikeExpression?: boolean;
}

export type TypeScriptTokenType = ts.ClassificationTypeNames | 'functionDeclaration' | 'callExpression';
export type TypeScriptToken = Token<ts.ClassificationTypeNames> & TypeScriptTokenProperties;

export function TypeScriptToken({
  sourcePosition,
  isCallLikeExpression,
  ...tokenProperties
}: TypeScriptTokenProperties): TypeScriptToken {
  return {
    ...Token(tokenProperties),
    sourcePosition,
    isCallLikeExpression,
  };
}

const ignoredClassifications = new Set([
  ts.ClassificationTypeNames.text,
  ts.ClassificationTypeNames.whiteSpace,
]);

const memoizedGetTokensByLine = memoize((
  fullText: string,
  preambleCode: string,
  fileName: string,
  languageService: ts.LanguageService,
): CacheableLineTokens<TypeScriptToken>[] => {
  const lines = fullText.split('\n');
  const characterAccumByLine = lines.reduce((indices: number[], line, index) => (
    [...indices, (indices[index - 1] || preambleCode.length) + line.length + 1] // Add one for '\n'
  ), []);

  const visibleSpan = { start: preambleCode.length, length: fullText.length };
  const semanticClassifications = languageService.getSemanticClassifications(fileName, visibleSpan);
  // const program = languageService.getProgram()!;
  // const sourceFile = program.getSourceFile(fileName)!;
  // const identifierIterator = createNodeWalker(sourceFile, ts.isCallLikeExpression);
  // let currentNode = identifierIterator.next();
  return languageService.getSyntacticClassifications(fileName, visibleSpan)
    .reduce((tokens: CacheableLineTokens<TypeScriptToken>[], span) => {
      // No need to tokenize whitespace etc.; it will just make rendering slower
      if (ignoredClassifications.has(span.classificationType)) {
        return tokens;
      }

      const startLine = sortedIndex(characterAccumByLine, span.textSpan.start);
      const absoluteEnd = span.textSpan.start + span.textSpan.length;
      const start = span.textSpan.start - (characterAccumByLine[startLine - 1] || preambleCode.length);
      // Micro-optimization: endLine will almost always be equal to startLine,
      // so check that location first before doing the binary sort.
      const endLine = absoluteEnd <= characterAccumByLine[startLine]
        ? startLine
        : sortedIndex(characterAccumByLine, absoluteEnd);
      const end = absoluteEnd - (characterAccumByLine[endLine - 1] || preambleCode.length);

      // Let semantic classification win over syntactic classification
      let type = span.classificationType;
      if (semanticClassifications[0] && semanticClassifications[0].textSpan.start === span.textSpan.start) {
        type = semanticClassifications.shift()!.classificationType;
      }

      // let isCallLikeExpression = false;
      // if (type === ts.ClassificationTypeNames.identifier) {
      //   while (
      //     currentNode.value
      //     && currentNode.value.pos + currentNode.value.getLeadingTriviaWidth() < span.textSpan.start
      //   ) {
      //     currentNode = identifierIterator.next();
      //   }
      //   if (currentNode.value
      //     && currentNode.value.pos + currentNode.value.getLeadingTriviaWidth() === span.textSpan.start
      //   ) {
      //     isCallLikeExpression = true;
      //   }
      // }

      for (let i = startLine; i <= endLine; i++) {
        const lineTokens = tokens[i] || { hash: '', tokens: [] };
        const token = TypeScriptToken({
          type,
          sourcePosition: span.textSpan.start,
          isCallLikeExpression: false,
          start: i === startLine ? start : 0,
          end: i === endLine ? end : lines[i].length,
        });
        lineTokens.hash += `:${token.getHash()}`;
        lineTokens.tokens.push(token);
        tokens[i] = lineTokens;
      }

      return tokens;
    }, []);
}, {
  length: 2,
  max: 1,
});

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<TypeScriptToken> {
  return {
    tokenize: (fullText, lineIndex) => {
      const { fileName, languageService } = options;
      const preambleCode = options.preambleCode || '';
      const tokensByLine = memoizedGetTokensByLine(fullText, preambleCode, fileName, languageService);
      return tokensByLine[lineIndex] || { hash: '', tokens: [] };
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
