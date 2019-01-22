import ts from 'typescript';
import { Tokenizer } from './types';
import { Token } from './token';

export enum TypeScriptTokenType {
  Identifier = 'identifier',
}

export interface TypeScriptTokenizerOptions {
  fileName: string;
  preambleCode?: string;
  languageService: ts.LanguageService;
}

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<TypeScriptTokenType> {
  return {
    tokenTypes: Object.values(TypeScriptTokenType),
    tokenize: text => {
      const sourceFile = options.languageService.getProgram()!.getSourceFile(options.fileName)!;
      const preambleCode = options.preambleCode || '';
      if (preambleCode + text !== sourceFile.text) {
        throw new Error('InteractiveCodeBlock is out of sync with TypeScript program');
      }

      const tokens: Token<TypeScriptTokenType>[] = [];
      ts.forEachChild(sourceFile, function walk(node) {
        if (node.kind === ts.SyntaxKind.Identifier) {
          const start = node.getStart(sourceFile) - preambleCode.length;
          if (start < 0) {
            return;
          }

          tokens.push(Token({
            type: TypeScriptTokenType.Identifier,
            start,
            end: node.getEnd() - preambleCode.length,
          }));
        } else {
          ts.forEachChild(node, walk);
        }
      });

      return tokens;
    },
  };
}
