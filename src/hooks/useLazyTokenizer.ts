import React from 'react';
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

const getTmTokenizer = async () => {
  const grammar = await tmRegistry.loadGrammar('source.tsx');
  return {
    initialized: true,
    loading: false,
    tokenizer: createTmGrammarTokenizer({ grammar }),
  };
};

export function useLazyTokenizer({ initialTokens, editable }: UseLazyTokenizerOptions) {
  const staticTokenizer = createStaticTokenizer(initialTokens);
  const [tokenizer, setTokenizer] = React.useState({
    initialized: false,
    loading: false,
    tokenizer: staticTokenizer,
  });

  if (editable && !tokenizer.initialized && !tokenizer.loading) {
    setTokenizer({ ...tokenizer, loading: true });
    getTmTokenizer().then(setTokenizer);
  }

  return tokenizer.tokenizer;
}
