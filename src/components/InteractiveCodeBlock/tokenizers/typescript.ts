import ts from 'typescript';
import { Tokenizer } from './types';
import { Token } from './token';

export interface TypeScriptTokenizerOptions {
  fileName: string;
  preambleCode?: string;
  languageService: ts.LanguageService;
}

const ignoredClassifications = new Set([
  ts.ClassificationTypeNames.text,
  ts.ClassificationTypeNames.whiteSpace,
]);

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<ts.ClassificationTypeNames> {
  return {
    tokenTypes: Object.values(ts.ClassificationTypeNames),
    tokenize: text => {
      const { fileName, languageService } = options;
      const sourceFile = options.languageService.getProgram()!.getSourceFile(fileName)!;
      const preambleCode = options.preambleCode || '';
      if (preambleCode + text !== sourceFile.text) {
        throw new Error('InteractiveCodeBlock is out of sync with TypeScript program');
      }

      const visibleSpan = { start: preambleCode.length, length: sourceFile.text.length - preambleCode.length };
      const semanticClassifications = languageService.getSemanticClassifications(fileName, visibleSpan);
      return languageService.getSyntacticClassifications(fileName, visibleSpan)
        .reduce((tokens: Token<ts.ClassificationTypeNames>[], span) => {
          // No need to tokenize whitespace etc.; it will just make rendering slower
          if (ignoredClassifications.has(span.classificationType)) {
            return tokens;
          }

          // Let semantic classification win over syntactic classification
          if (semanticClassifications[0] && semanticClassifications[0].textSpan.start === span.textSpan.start) {
            const classification = semanticClassifications.shift()!;
            return tokens.concat(Token({
              type: classification.classificationType,
              start: classification.textSpan.start - preambleCode.length,
              end: classification.textSpan.start + classification.textSpan.length - preambleCode.length,
            }));
          }

          return tokens.concat(Token({
            type: span.classificationType,
            start: span.textSpan.start - preambleCode.length,
            end: span.textSpan.start + span.textSpan.length - preambleCode.length,
          }));
        }, []);
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
