export interface TokenProperties<TypeT extends string, ScopeNameT extends string> {
  readonly type: TypeT;
  readonly scopes: ScopeNameT[];
  readonly start: number;
  readonly end: number;
}

export interface Token<TypeT extends string, ScopeNameT extends string> extends TokenProperties<TypeT, ScopeNameT> {
  readonly hash: string;
}

export function Token<TypeT extends string, ScopeNameT extends string>(
  properties: TokenProperties<TypeT, ScopeNameT>,
): Token<TypeT, ScopeNameT> {
  return {
    ...properties,
    hash: `${properties.scopes.join('!')}.${properties.start}.${properties.end}`,
  };
}
