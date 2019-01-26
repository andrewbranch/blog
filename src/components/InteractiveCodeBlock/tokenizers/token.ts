export interface TokenProperties<TokenTypeT extends string> {
  type: TokenTypeT;
  typeHash?: string;
  start: number;
  end: number;
}

export interface Token<TokenTypeT extends string> extends TokenProperties<TokenTypeT> {
  is<T extends TokenTypeT>(type: T): this is Token<T>;
  getHash(): string;
}

export function Token<TokenTypeT extends string>(properties: TokenProperties<TokenTypeT>): Token<TokenTypeT> {
  return {
    ...properties,
    is: type => type === properties.type,
    getHash: () => `${properties.typeHash || properties.type}.${properties.start}.${properties.end}`,
  };
}
