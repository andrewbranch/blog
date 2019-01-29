import { Registry, parseRawGrammar, IOnigLib } from 'vscode-textmate';
import { loadWASM, OnigScanner, OnigString } from 'onigasm';

export enum LanguageFile {
  TypeScriptReact,
}

export interface FileProvider {
  readLanguageFile: (fileName: LanguageFile) => Promise<string>;
  readOnigasmFile: () => Promise<ArrayBuffer>;
}

let registry: Registry | undefined;
export function getTmRegistry(fileProvider: FileProvider) {
  if (registry) {
    return registry;
  }

  registry = new Registry({
    loadGrammar: async scopeName => {
      switch (scopeName) {
        case 'source.tsx':
          const content = await fileProvider.readLanguageFile(LanguageFile.TypeScriptReact);
          return parseRawGrammar(content, '');
        default:
          return null;
      }
    },
    getOnigLib: async () => {
      const wasmBin = await fileProvider.readOnigasmFile();
      return loadWASM(wasmBin).then<IOnigLib>(() => ({
        createOnigScanner: patterns => new OnigScanner(patterns),
        createOnigString: s => new OnigString(s),
      }));
    },
  });

  return registry;
}
