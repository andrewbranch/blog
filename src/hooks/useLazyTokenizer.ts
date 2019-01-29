import React from 'react';
import {
  CacheableLineTokens,
  Token,
  createTmGrammarTokenizer,
  createStaticTokenizer,
} from '../components/InteractiveCodeBlock/tokenizers';
import { getTmRegistry } from '../utils/textmate/getTmRegistry';
import { webpackFileProvider } from '../utils/textmate/webpackFileProvider';

export interface UseLazyTokenizerOptions {
  initialTokens: CacheableLineTokens<Token<string, string>>[];
  editable: boolean;
}

const getTmTokenizer = async () => {
  const grammar = await getTmRegistry(webpackFileProvider).loadGrammar('source.tsx');
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
