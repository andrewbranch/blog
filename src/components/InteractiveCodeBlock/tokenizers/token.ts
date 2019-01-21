export interface Token<TokenTypeT extends string> {
  type: TokenTypeT;
  start: number;
  end: number;
  is<T extends TokenTypeT>(type: T): this is Token<T>;
}

export type TokenProperties<TokenTypeT extends string> = Pick<Token<TokenTypeT>, 'type' | 'start' | 'end'>;

export function Token<TokenTypeT extends string>(properties: TokenProperties<TokenTypeT>): Token<TokenTypeT> {
  return {
    ...properties,
    is: type => type === properties.type,
  };
}
