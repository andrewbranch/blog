import { Extra, Libraries } from './types';

export function isTypeScriptFileName(fileName: string) {
  const lowerCaseFileName = fileName.toLowerCase();
  return lowerCaseFileName.endsWith('.ts') || lowerCaseFileName.endsWith('.tsx');
}

export async function getExtraLibFiles(libNames: Extra[], lib: Libraries): Promise<Map<string, string>> {
  const maps = await Promise.all(libNames.map(libName => lib.extra[libName].getFiles()));
  return new Map(maps.reduce((entries: [string, string][], map) => [
    ...Array.from(entries),
    ...Array.from(map.entries()),
  ], []));
}
