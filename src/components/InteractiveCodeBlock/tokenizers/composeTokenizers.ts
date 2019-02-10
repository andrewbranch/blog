import { Tokenizer } from './types';
import { Token } from './token';

export function composeTokenizers<T extends Tokenizer<Token<string, string>>[]>(
  ...tokenizers: T
): T[0] | T[1] {
  return tokenizers.reduce((composed: Tokenizer<Token<string, string>>, tokenizer: T[0]) => ({
    tokenizeDocument: (text: string) => {
      const combinedResult = composed.tokenizeDocument ? [...composed.tokenizeDocument(text)] : [];
      if (tokenizer.tokenizeDocument) {
        tokenizer.tokenizeDocument(text).forEach((line, index) => {
          combinedResult[index] = combinedResult[index] || { hash: '', tokens: [] };
          combinedResult[index].hash += `!${line.hash}`;
          combinedResult[index].tokens.push(...line.tokens);
        });
      }
      return combinedResult;
    },
    dispose: () => {
      if (composed.dispose) {
        composed.dispose();
      }
      if (tokenizer.dispose) {
        tokenizer.dispose();
      }
    },
    subscribe: (handler: () => void) => {
      if (composed.subscribe) {
        composed.subscribe(handler);
      }
      if (tokenizer.subscribe) {
        tokenizer.subscribe(handler);
      }
    },
  }), {});
}
