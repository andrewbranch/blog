export interface TokenProperties<TypeT extends string, ScopeNameT extends string> {
  type: TypeT;
  scopes: ScopeNameT[];
  start: number;
  end: number;
}

export interface Token<TypeT extends string, ScopeNameT extends string> extends TokenProperties<TypeT, ScopeNameT> {
  getHash(): string;
}

export function Token<TypeT extends string, ScopeNameT extends string>(
  properties: TokenProperties<TypeT, ScopeNameT>,
): Token<TypeT, ScopeNameT> {
  return {
    ...properties,
    getHash: () => `${properties.scopes.join('!')}.${properties.start}.${properties.end}`,
  };
}
