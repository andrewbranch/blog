import ts from 'typescript';
import { Extra, Libraries } from './types';

export async function getExtraLibFiles(libNames: Extra[], lib: Libraries): Promise<Map<string, ts.SourceFile[]>> {
  return new Map(await Promise.all(libNames.map(async libName => {
    const entry: [string, ts.SourceFile[]] = [
      lib.extra[libName].modulePath,
      await lib.extra[libName].getSourceFiles(),
    ];
    return entry;
  })));
}
