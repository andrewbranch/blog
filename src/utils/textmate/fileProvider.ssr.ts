/// <reference types="@types/node" />
import fs from 'fs';
import path from 'path';
import { FileProvider, LanguageFile } from './getTmRegistry';
import { assertUnreachable } from '../assertions';

export const ssrFileProvider: FileProvider = {
  readLanguageFile: async languageFile => {
    switch (languageFile) {
      case LanguageFile.TypeScriptReact: {
        const fileName = path.resolve(__dirname, 'TypeScriptReact.tmLanguage');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } case LanguageFile.Markdown: {
        const fileName = path.resolve(__dirname, 'Markdown.tmLanguage');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } case LanguageFile.YAML: {
        const fileName = path.resolve(__dirname, 'YAML.tmLanguage');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } case LanguageFile.Shell: {
        const fileName = path.resolve(__dirname, 'shell-unix-bash.tmLanguage.json');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } case LanguageFile.JSON: {
        const fileName = path.resolve(__dirname, 'JSONC.tmLanguage.json');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } case LanguageFile.CSS: {
        const fileName = path.resolve(__dirname, 'css.tmLanguage.json');
        return { contents: fs.readFileSync(fileName, 'utf8'), fileName };
      } default:
        return assertUnreachable(languageFile);
    }
  },
  readOnigasmFile: async () => {
    return fs.readFileSync(path.resolve(__dirname, '../../../node_modules/onigasm/lib/onigasm.wasm')).buffer;
  },
};
