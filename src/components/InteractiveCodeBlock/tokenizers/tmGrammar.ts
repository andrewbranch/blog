import { IGrammar, StackElement, ITokenizeLineResult } from 'vscode-textmate';
import { Tokenizer, CacheableLineTokens } from './types';
import { Token } from './token';

export interface TmGrammarTokenizerOptions {
  grammar: IGrammar;
}

export type TextMateToken = Token<'tm', string>;

interface LineResult {
  prevStack?: StackElement;
  stack: StackElement;
  cacheableLine: CacheableLineTokens<Token<'tm', string>>;
}

function stackEquals(a: StackElement | undefined, b: StackElement | undefined) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.equals(b);
}

function createLineCache() {
  let prevKeys = new Set<string>();
  let keys = new Set<string>();
  const map = new Map<string, LineResult>();

  function get(line: string, stack?: StackElement) {
    keys.add(line);
    prevKeys.delete(line);
    const candidate = map.get(line);
    if (candidate && stackEquals(candidate.prevStack, stack)) {
      return candidate;
    }
  }

  function set(line: string, result: LineResult) {
    // Not going to update keys because we assume a set follows a get
    map.set(line, result);
  }

  function sync() {
    prevKeys.forEach(key => map.delete(key));
    prevKeys = keys;
    keys = new Set<string>();
  }

  function clear() {
    map.clear();
    keys.clear();
    prevKeys.clear();
  }

  return { get, set, sync, clear };
}

function toCacheableLineTokens(result: ITokenizeLineResult): CacheableLineTokens<TextMateToken> {
  return result.tokens.reduce((container: CacheableLineTokens<TextMateToken>, tmToken) => {
    const token = Token({
      type: 'tm',
      scopes: tmToken.scopes,
      start: tmToken.startIndex,
      end: tmToken.endIndex,
    });
    return {
      tokens: container.tokens.concat(token),
      hash: container.hash + `:${token.hash}`,
    };
  }, { tokens: [], hash: '' });
}

export function createTmGrammarTokenizer(options: TmGrammarTokenizerOptions): Tokenizer<TextMateToken> {
  const { grammar } = options;
  const lineCache = createLineCache();

  function tokenizeLine(line: string, stack: StackElement | undefined): LineResult {
    const cached = lineCache.get(line, stack);
    if (cached) {
      return cached;
    }

    const tmResult = grammar.tokenizeLine(line, stack!);
    const lineResult: LineResult = {
      prevStack: stack,
      stack: tmResult.ruleStack,
      cacheableLine: toCacheableLineTokens(tmResult),
    };
    lineCache.set(line, lineResult);
    return lineResult;
  }

  return {
    tokenizeDocument: text => {
      const lines = text.split('\n');
      const result = lines.reduce(({ stack, cache }, line) => {
        const lineResult = tokenizeLine(line, stack);
        return {
          stack: lineResult.stack,
          cache: cache.concat(lineResult.cacheableLine),
        };
      }, {
        stack: undefined as StackElement | undefined,
        cache: [] as CacheableLineTokens<TextMateToken>[],
      });
      lineCache.sync();
      return result.cache;
    },
    dispose: () => lineCache.clear(),
  };
}
