import { Registry, parseRawGrammar, IOnigLib } from 'vscode-textmate';
import { isSSR } from './ssr';
import { loadWASM, OnigScanner, OnigString } from 'onigasm';

export const tmRegistry = new Registry({
  loadGrammar: async scopeName => {
    switch (scopeName) {
      case 'source.tsx':
        const content = isSSR
          ? require('fs').readFileSync('./src/utils/TypeScriptReact.tmLanguage', 'utf8')
          // tslint:disable-next-line:no-implicit-dependencies
          : (await import('!raw-loader!./TypeScriptReact.tmLanguage')).default;
        return parseRawGrammar(content, '');
      default:
        return null;
    }
  },
  getOnigLib: async () => {
    const wasmBin = isSSR
      ? require('fs').readFileSync('./node_modules/onigasm/lib/onigasm.wasm').buffer
      : (await import('onigasm/lib/onigasm.wasm')).default;
    return loadWASM(wasmBin).then<IOnigLib>(() => ({
      createOnigScanner: patterns => new OnigScanner(patterns),
      createOnigString: s => new OnigString(s),
    }));
  },
});
