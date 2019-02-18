import { FileProvider, LanguageFile } from './getTmRegistry';

export const webpackFileProvider: FileProvider = {
  readLanguageFile: async languageFile => {
    switch (languageFile) {
      case LanguageFile.TypeScriptReact:
        // tslint:disable-next-line:no-implicit-dependencies
        return (await import('!raw-loader!./TypeScriptReact.tmLanguage')).default;
      default:
        throw new Error(`${languageFile} should not be used in the browser.`);
    }
  },
  readOnigasmFile: async () => (await import('onigasm/lib/onigasm.wasm')).default,
};
