import { Registry, parseRawGrammar, IOnigLib } from 'vscode-textmate';
import { loadWASM, OnigScanner, OnigString } from 'onigasm';

export enum LanguageFile {
  TypeScriptReact = 'source.tsx',
  Markdown = 'text.html.markdown',
  YAML = 'source.yaml',
  Shell = 'source.shell',
  JSON = 'source.json.comments',
}

function isLanguageFileScopeName(scopeName: string): scopeName is LanguageFile {
  return Object.values(LanguageFile).includes(scopeName);
}

export interface FileProvider {
  readLanguageFile: (fileName: LanguageFile) => Promise<{ fileName: string, contents: string }>;
  readOnigasmFile: () => Promise<ArrayBuffer>;
}

let registry: Registry | undefined;
export function getTmRegistry(fileProvider: FileProvider) {
  if (registry) {
    return registry;
  }

  registry = new Registry({
    loadGrammar: async scopeName => {
      if (isLanguageFileScopeName(scopeName)) {
        const { fileName, contents } = await fileProvider.readLanguageFile(scopeName);
        return parseRawGrammar(contents, fileName);
      }
      return null;
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
