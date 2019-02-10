import { Token, TokenProperties } from './token';

export interface CacheableLineTokens<T extends Token<string, string>> {
  hash: string;
  tokens: T[];
}

export interface TypeScriptTokenizerOptions {
  fileName: string;
  visibleSpan?: import('typescript').TextSpan;
  languageService: import('typescript').LanguageService;
}

export interface TypeScriptTokenProperties<
  ScopeNameT extends string
> extends TokenProperties<TypeScriptTokenType, ScopeNameT> {
  sourcePosition: number;
}

export enum TypeScriptTokenType {
  Identifier = 'ts.identifier',
  Diagnostic = 'ts.diagnostic',
}

export enum TypeScriptDiagnosticTokenType {
  Syntactic = 'syntactic',
  Semantic = 'semantic',
}

export type TypeScriptTokenTypeName = import('typescript').ClassificationTypeNames | TypeScriptDiagnosticTokenType;

export interface Tokenizer<TokenT extends Token<string, string>> {
  tokenizeDocument?: (fullText: string) => CacheableLineTokens<TokenT>[];
  tokenizeLine?: (lineText: string) => CacheableLineTokens<TokenT>;
  dispose?: () => void;
  subscribe?: (onUpdated: () => void) => void;
}
