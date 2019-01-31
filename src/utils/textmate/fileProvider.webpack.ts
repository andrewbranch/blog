import { FileProvider, LanguageFile } from './getTmRegistry';
import { assertUnreachable } from '../assertions';

export const webpackFileProvider: FileProvider = {
  readLanguageFile: async languageFile => {
    switch (languageFile) {
      case LanguageFile.TypeScriptReact:
        // tslint:disable-next-line:no-implicit-dependencies
        return (await import('!raw-loader!./TypeScriptReact.tmLanguage')).default;
      default:
        return assertUnreachable(languageFile);
    }
  },
  readOnigasmFile: async () => (await import('onigasm/lib/onigasm.wasm')).default,
};
