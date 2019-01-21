import ts from 'typescript';
import { Tokenizer, Token } from './types';

export enum TypeScriptTokenType {
  Identifier = 'identifier',
}

export interface TypeScriptTokenizerOptions {
  sourceFile: ts.SourceFile;
}

export function createTypeScriptTokenizer(options: TypeScriptTokenizerOptions): Tokenizer<TypeScriptTokenType> {
  return {
    tokenTypes: Object.values(TypeScriptTokenType),
    tokenize: text => {
      if (text !== options.sourceFile.text) {
        throw new Error('InteractiveCodeBlock is out of sync with TypeScript program');
      }

      const tokens: Token<TypeScriptTokenType>[] = [];
      ts.forEachChild(options.sourceFile, function walk(node) {
        if (node.kind === ts.SyntaxKind.Identifier) {
          tokens.push({
            type: TypeScriptTokenType.Identifier,
            start: node.getStart(options.sourceFile),
            end: node.getEnd(),
          });
        } else {
          ts.forEachChild(node, walk);
        }
      });

      return tokens;
    },
  };
}
