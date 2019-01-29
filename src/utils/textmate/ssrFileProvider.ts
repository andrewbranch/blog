import fs from 'fs';
import path from 'path';
import { FileProvider, LanguageFile } from './getTmRegistry';
import { assertUnreachable } from '../assertions';

export const ssrFileProvider: FileProvider = {
  readLanguageFile: async languageFile => {
    switch (languageFile) {
      case LanguageFile.TypeScriptReact:
        return fs.readFileSync(path.resolve(__dirname, 'TypeScriptReact.tmLanguage'), 'utf8');
      default:
        return assertUnreachable(languageFile);
    }
  },
  readOnigasmFile: async () => {
    return fs.readFileSync(path.resolve(__dirname, '../../../node_modules/onigasm/lib/onigasm.wasm')).buffer;
  },
};
