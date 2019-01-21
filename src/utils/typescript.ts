import ts from 'typescript';

export function createVirtualCompilerHost(sourceFiles: ts.SourceFile[]): ts.CompilerHost {
  const libSourceFile = ts.createSourceFile(
    '/lib.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.d.ts'),
    ts.ScriptTarget.ES2015,
  );
  const sourceFileMap = new Map([libSourceFile, ...sourceFiles].map(
    (file): [string, ts.SourceFile] => [file.fileName, file],
  ));

  return {
    fileExists: fileName => sourceFileMap.has(fileName),
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: () => libSourceFile.fileName,
    getDirectories: () => [],
    getNewLine: () => '\n',
    getSourceFile: fileName => sourceFileMap.get(fileName),
    readFile: fileName => sourceFileMap.get(fileName)!.text,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => null,
  };
}

export function createVirtualLanguageServiceHost(sourceFiles: ts.SourceFile[]): ts.LanguageServiceHost {
  const fileNames = sourceFiles.map(file => file.fileName);
  const compilerHost = createVirtualCompilerHost(sourceFiles);
  return {
    ...compilerHost,
    getCompilationSettings: () => ({ sourceFiles: fileNames }),
    getScriptFileNames: () => fileNames,
    getScriptSnapshot: fileName => {
      const sourceFile = compilerHost.getSourceFile(fileName, ts.ScriptTarget.ES2015);
      if (sourceFile) {
        return ts.ScriptSnapshot.fromString(sourceFile.text);
      }
    },
    getScriptVersion: () => '0',
    writeFile: () => null,
  };
}
