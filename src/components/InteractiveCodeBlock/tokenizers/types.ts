export interface Token<TokenTypeT extends string> {
  type: TokenTypeT;
  start: number;
  end: number;
}

export interface Tokenizer<T extends string> {
  tokenTypes: T[];
  tokenize: (text: string) => Token<T>[];
}
