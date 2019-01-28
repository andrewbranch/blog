import React from 'react';
import { useAsync } from 'react-async-hook';
import {
  CacheableLineTokens,
  Token,
  createTmGrammarTokenizer,
  createStaticTokenizer,
} from '../components/InteractiveCodeBlock/tokenizers';
import { tmRegistry } from '../utils/tmRegistry';

export interface UseLazyTokenizerOptions {
  initialTokens: CacheableLineTokens<Token<string, string>>[],
  editable: boolean;
}

export function useLazyTokenizer({ initialTokens, editable }: UseLazyTokenizerOptions) {
  const staticTokenizer = createStaticTokenizer(initialTokens);
  const getTokenizer = React.useMemo(() => {
    if (editable) {
      return async () => staticTokenizer;
    } else {
      return async () => {
        const grammar = await tmRegistry.loadGrammar('source.tsx');
        return createTmGrammarTokenizer({ grammar });
      };
    }
  }, [editable]);
  const { result } = useAsync(getTokenizer);
  return result || staticTokenizer;
}
