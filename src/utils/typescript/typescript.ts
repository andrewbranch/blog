import ts from 'typescript';

export function createVirtualCompilerHost(
  sourceFiles: Map<string, ts.SourceFile>,
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile>,
): {
  compilerHost: ts.CompilerHost,
  updateFile: (sourceFile: ts.SourceFile) => boolean,
} {
  return {
    compilerHost: {
      fileExists: fileName => {
        return sourceFiles.has(fileName)
          || tsLibFiles.has(fileName)
          || thirdPartyLibraries.has(fileName);
      },
      getCanonicalFileName: fileName => fileName,
      getCurrentDirectory: () => '/',
      getDefaultLibFileName: () => '/lib.es2015.d.ts',
      getDirectories: () => [],
      getNewLine: () => '\n',
      getSourceFile: fileName => {
        return sourceFiles.get(fileName)
          || tsLibFiles.get(fileName)
          || thirdPartyLibraries.get(fileName);
      },
      readFile: fileName => {
        return (sourceFiles.get(fileName)
          || tsLibFiles.get(fileName)
          || thirdPartyLibraries.get(fileName))!.text;
      },
      useCaseSensitiveFileNames: () => true,
      writeFile: () => null,
    },
    updateFile: sourceFile => {
      const alreadyExists = sourceFiles.has(sourceFile.fileName);
      sourceFiles.set(sourceFile.fileName, sourceFile);
      return alreadyExists;
    },
  };
}

export function createVirtualWatchHost(
  sourceFiles: Map<string, ts.SourceFile>,
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile>,
): {
  watchHost: ts.CompilerHost & ts.WatchCompilerHost<ts.BuilderProgram>,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = Array.from(sourceFiles.keys());
  const watchedFiles = new Map<string, Set<ts.FileWatcherCallback>>();
  const { compilerHost, updateFile } = createVirtualCompilerHost(sourceFiles, tsLibFiles, thirdPartyLibraries);
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
  sourceFiles: Map<string, ts.SourceFile>,
  compilerHost: ts.CompilerHost,
): {
  languageServiceHost: ts.LanguageServiceHost,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = Array.from(sourceFiles.keys());
  const fileVersions = new Map<string, string>();
  let projectVersion = 0;
  return {
    languageServiceHost: {
      ...compilerHost,
      getProjectVersion: () => projectVersion.toString(),
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
      projectVersion++;
      fileVersions.set(fileName, projectVersion.toString());
    },
  };
}

export interface VirtualTypeScriptEnvironment {
  watchProgram: ts.WatchOfFilesAndCompilerOptions<ts.BuilderProgram>;
  languageService: ts.LanguageService;
  typeChecker: ts.TypeChecker;
  updateFile: (sourceFile: ts.SourceFile) => void;
  updateFileFromText: (fileName: string, content: string) => void;
}

export function createVirtualTypeScriptEnvironment(
  sourceFiles: Map<string, ts.SourceFile>,
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile>,
): VirtualTypeScriptEnvironment {
  const watchHostController = createVirtualWatchHost(sourceFiles, tsLibFiles, thirdPartyLibraries);
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

/**
 * Like ts.forEachChild, but in generator form.
 * @param node The root node to walk.
 * @param predicate Specifies what nodes to yield.
 */
export function* createNodeWalker<T extends ts.Node = ts.Node>(
  node: ts.Node,
  predicate: (node: ts.Node) => node is T,
): IterableIterator<T> {
  if (predicate(node)) {
    yield node;
  }
  const children = node.getChildren();
  if (children && children.length) {
    for (const child of children) {
      yield* createNodeWalker(child, predicate);
    }
  }
}
