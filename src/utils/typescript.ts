import ts from 'typescript';

export interface LibraryFile {
  moduleName: string;
  modulePath: string;
  typingsSourceFile: ts.SourceFile;
}

const reactLibraryFile: LibraryFile = {
  moduleName: 'react',
  modulePath: '/node_modules/react/index.js',
  typingsSourceFile: ts.createSourceFile(
    '/node_modules/@types/react/index.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    require('!raw-loader!@types/react/index.d.ts'),
    ts.ScriptTarget.ES2015,
  ),
};

export const libraryFiles = { react: reactLibraryFile };

export function createVirtualCompilerHost(sourceFiles: ts.SourceFile[], libraries: LibraryFile[] = []): {
  compilerHost: ts.CompilerHost,
  updateFile: (sourceFile: ts.SourceFile) => boolean,
} {
  const libSourceFile = ts.createSourceFile(
    '/lib.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.d.ts'),
    ts.ScriptTarget.ES2015,
  );

  const sourceFileMap = new Map([libSourceFile, ...libraries.map(lib => lib.typingsSourceFile), ...sourceFiles].map(
    (file): [string, ts.SourceFile] => [file.fileName, file],
  ));

  return {
    compilerHost: {
      fileExists: fileName => sourceFileMap.has(fileName) || libraries.some(lib => lib.modulePath === fileName),
      getCanonicalFileName: fileName => fileName,
      getCurrentDirectory: () => '/',
      getDefaultLibFileName: () => libSourceFile.fileName,
      getDirectories: () => [],
      getNewLine: () => '\n',
      getSourceFile: fileName => sourceFileMap.get(fileName),
      readFile: fileName => sourceFileMap.get(fileName)!.text,
      useCaseSensitiveFileNames: () => true,
      writeFile: () => null,
    },
    updateFile: sourceFile => {
      const alreadyExists = sourceFileMap.has(sourceFile.fileName);
      sourceFileMap.set(sourceFile.fileName, sourceFile);
      return alreadyExists;
    },
  };
}

export function createVirtualWatchHost(sourceFiles: ts.SourceFile[], libraries: LibraryFile[] = []): {
  watchHost: ts.CompilerHost & ts.WatchCompilerHost<ts.BuilderProgram>,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = sourceFiles.map(file => file.fileName);
  const watchedFiles = new Map<string, Set<ts.FileWatcherCallback>>();
  const { compilerHost, updateFile } = createVirtualCompilerHost(sourceFiles, libraries);
  return {
    watchHost: {
      ...compilerHost,
      createProgram: (rootNames, options, host, oldProgram, configFileParsingDiagnostics, projectReferences) => {
        return ts.createAbstractBuilder(
          ts.createProgram({
            rootNames: rootNames || fileNames,
            options: options || {},
            host,
            oldProgram: oldProgram && oldProgram.getProgram(),
            configFileParsingDiagnostics,
            projectReferences,
          }),
          { useCaseSensitiveFileNames: () => true },
        );
      },
      watchFile: (path, callback) => {
        const callbacks = watchedFiles.get(path) || new Set();
        callbacks.add(callback);
        watchedFiles.set(path, callbacks);
        return {
          close: () => {
            const cbs = watchedFiles.get(path);
            if (cbs) {
              cbs.delete(callback);
            }
          },
        };
      },
      watchDirectory: () => ({ close: () => null }),
    },
    updateFile: sourceFile => {
      const alreadyExists = updateFile(sourceFile);
      const callbacks = watchedFiles.get(sourceFile.fileName);
      if (callbacks) {
        Array.from(callbacks.values()).forEach(cb => {
          cb(sourceFile.fileName, alreadyExists ? ts.FileWatcherEventKind.Changed : ts.FileWatcherEventKind.Created);
        });
      }
    },
  };
}

export function createVirtualLanguageServiceHost(
  sourceFiles: ts.SourceFile[],
  compilerHost: ts.CompilerHost & ts.WatchCompilerHost<ts.BuilderProgram>,
): {
  languageServiceHost: ts.LanguageServiceHost,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = sourceFiles.map(file => file.fileName);
  const fileVersions = new Map<string, string>();
  return {
    languageServiceHost: {
      ...compilerHost,
      getCompilationSettings: () => ({ sourceFiles: fileNames }),
      getScriptFileNames: () => fileNames,
      getScriptSnapshot: fileName => {

        const sourceFile = compilerHost.getSourceFile(fileName, ts.ScriptTarget.ES2015);
        if (sourceFile) {
          return ts.ScriptSnapshot.fromString(sourceFile.text);
        }
      },
      getScriptVersion: fileName => {
        return fileVersions.get(fileName) || '0';
      },
      writeFile: () => null,
    },
    updateFile: ({ fileName }: ts.SourceFile) => {
      fileVersions.set(fileName, Date.now().toString());
    },
  };
}

export function createVirtualTypeScriptEnvironment(sourceFiles: ts.SourceFile[], libraries: LibraryFile[] = []): {
  watchProgram: ts.WatchOfFilesAndCompilerOptions<ts.BuilderProgram>,
  languageService: ts.LanguageService,
  typeChecker: ts.TypeChecker,
  updateFile: (sourceFile: ts.SourceFile) => void,
  updateFileFromText: (fileName: string, content: string) => void,
} {
  const watchHostController = createVirtualWatchHost(sourceFiles, libraries);
  const languageServiceHostController = createVirtualLanguageServiceHost(sourceFiles, watchHostController.watchHost);
  const languageService = ts.createLanguageService(languageServiceHostController.languageServiceHost);
  const watchProgram = ts.createWatchProgram({
    ...watchHostController.watchHost,
    rootFiles: languageServiceHostController.languageServiceHost.getScriptFileNames(),
    options: {},
  });
  const updateFile = (sourceFile: ts.SourceFile) => {
    languageServiceHostController.updateFile(sourceFile);
    watchHostController.updateFile(sourceFile);
  };

  return {
    watchProgram,
    languageService,
    typeChecker: watchProgram.getProgram().getProgram().getTypeChecker(),
    updateFile,
    updateFileFromText: (fileName, content) => {
      updateFile(ts.createSourceFile(fileName, content, ts.ScriptTarget.ES2015));
    },
  };
}
