import React from 'react';
import {
  CacheableLineTokens,
  createTmGrammarTokenizer,
  createStaticTokenizer,
  Tokenizer,
  TextMateToken,
} from '../components/InteractiveCodeBlock/tokenizers';
import { getTmRegistry } from '../utils/textmate/getTmRegistry';
import { webpackFileProvider } from '../utils/textmate/fileProvider.webpack';
import { composeTokenizers } from '../components/InteractiveCodeBlock/tokenizers/composeTokenizers';

export type ComposedTokenT = TextMateToken
  | import('../components/InteractiveCodeBlock/tokenizers/typescript').TypeScriptToken;
export interface UseLazyTokenizerOptions {
  initialTokens: CacheableLineTokens<ComposedTokenT>[];
  editable: boolean;
  fileName: string;
  preambleCode?: string;
  languageService?: import('typescript').LanguageService;
}

async function getTmTokenizer() {
  const grammar = await getTmRegistry(webpackFileProvider).loadGrammar('source.tsx');
  return createTmGrammarTokenizer({ grammar });
}

// tslint:disable-next-line:max-line-length
type TypeScriptTokenizerOptions = import('../components/InteractiveCodeBlock/tokenizers/types').TypeScriptTokenizerOptions;
async function getTypeScriptTokenizer(options: TypeScriptTokenizerOptions) {
  const { createTypeScriptTokenizer } = await import('../components/InteractiveCodeBlock/tokenizers/typescript');
  return createTypeScriptTokenizer(options);
}

type ComposedTokenizer = Tokenizer<ComposedTokenT>;

export function useProgressiveTokenizer({
  initialTokens,
  editable,
  languageService,
  ...options
}: UseLazyTokenizerOptions): ComposedTokenizer {
  const emptyTokenizer = createStaticTokenizer(initialTokens);
  const [tokenizer, setTokenizer] = React.useState({
    initialized: false,
    loading: false,
    tokenizer: emptyTokenizer,
  });

  if (editable && !tokenizer.initialized && !tokenizer.loading && languageService) {
    setTokenizer({ ...tokenizer, loading: true });
    Promise.all([
      getTmTokenizer(),
      getTypeScriptTokenizer({ languageService, ...options }),
    ]).then(([tmTokenizer, typeScriptTokenizer]) => {
      setTokenizer({
        initialized: true,
        loading: false,
        tokenizer: composeTokenizers(tmTokenizer, typeScriptTokenizer),
      });
    });
  }

  return tokenizer.tokenizer;
}
