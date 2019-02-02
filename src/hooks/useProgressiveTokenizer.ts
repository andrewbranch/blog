import React, { useEffect, useRef } from 'react';
import { CacheableLineTokens, Tokenizer } from '../components/InteractiveCodeBlock/tokenizers/types';
import { createStaticTokenizer } from '../components/InteractiveCodeBlock/tokenizers/static';
import { TextMateToken, createTmGrammarTokenizer } from '../components/InteractiveCodeBlock/tokenizers/tmGrammar';
import { getTmRegistry } from '../utils/textmate/getTmRegistry';
import { webpackFileProvider } from '../utils/textmate/fileProvider.webpack';
import { composeTokenizers } from '../components/InteractiveCodeBlock/tokenizers/composeTokenizers';

export type ComposedTokenT = TextMateToken
  | import('../components/InteractiveCodeBlock/tokenizers/typescript').TypeScriptToken;
export interface UseLazyTokenizerOptions {
  initialTokens: CacheableLineTokens<ComposedTokenT>[];
  editable: boolean;
  fileName: string;
  visibleSpan?: import('typescript').TextSpan;
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
  visibleSpan,
  ...options
}: UseLazyTokenizerOptions): ComposedTokenizer {
  const emptyTokenizer = createStaticTokenizer(initialTokens);
  const prevVisibleSpan = useRef(visibleSpan);
  const [tokenizer, setTokenizer] = React.useState({
    initialized: false,
    loading: false,
    tokenizer: emptyTokenizer,
  });

  useEffect(() => {
    const needsInitialTokenizer = !tokenizer.initialized && !tokenizer.loading;
    const startChanged = visibleSpan && prevVisibleSpan.current && visibleSpan.start !== prevVisibleSpan.current.start;
    if (editable && languageService && (needsInitialTokenizer || startChanged)) {
      prevVisibleSpan.current = visibleSpan;
      setTokenizer({ ...tokenizer, loading: true });
      Promise.all([
        getTmTokenizer(),
        getTypeScriptTokenizer({ languageService, visibleSpan, ...options }),
      ]).then(([tmTokenizer, typeScriptTokenizer]) => {
        setTokenizer({
          initialized: true,
          loading: false,
          tokenizer: composeTokenizers(tmTokenizer, typeScriptTokenizer),
        });
      });
    }
  });

  return tokenizer.tokenizer;
}
