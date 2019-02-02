import ts from 'typescript';

const compilerOptions: ts.CompilerOptions = {
  ...ts.getDefaultCompilerOptions(),
  jsx: ts.JsxEmit.React,
  strict: true,
  target: ts.ScriptTarget.ES2015,
  lib: ['lib.dom.d.ts'],
  isolatedModules: true,
  module: ts.ModuleKind.ES2015,
  allowNonTsExtensions: true,
  noResolve: true,
  suppressOutputPathCheck: true,
  skipLibCheck: true,
  skipDefaultLibCheck: true,
};

export function createVirtualCompilerHost(
  sourceFiles: Map<string, ts.SourceFile>,
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile> = new Map(),
): {
  compilerHost: ts.CompilerHost,
  updateFile: (sourceFile: ts.SourceFile) => boolean,
} {
  const fileNames = [
    ...Array.from(sourceFiles.keys()),
    ...Array.from(tsLibFiles.keys()),
    ...Array.from(thirdPartyLibraries.keys()),
  ];
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
      readDirectory: directory => directory === '/' ? fileNames : [],
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
  thirdPartyLibraries: Map<string, ts.SourceFile> = new Map(),
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
      createProgram: (rootNames, _, host, oldProgram, configFileParsingDiagnostics, projectReferences) => {
        return ts.createAbstractBuilder(
          ts.createProgram({
            rootNames: rootNames || fileNames,
            options: compilerOptions,
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
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile> = new Map(),
  compilerHost: ts.CompilerHost,
): {
  languageServiceHost: ts.LanguageServiceHost,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = [
    ...Array.from(sourceFiles.keys()),
    ...Array.from(tsLibFiles.keys()),
    ...Array.from(thirdPartyLibraries.keys()),
  ];
  const fileVersions = new Map<string, string>();
  let projectVersion = 0;
  return {
    languageServiceHost: {
      ...compilerHost,
      getProjectVersion: () => projectVersion.toString(),
      getCompilationSettings: () => ({ sourceFiles: fileNames, ...compilerOptions }),
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
  updateFileFromText: (fileName: string, content: string, replaceTextSpan: ts.TextSpan) => void;
}

export function createVirtualTypeScriptEnvironment(
  sourceFiles: Map<string, ts.SourceFile>,
  tsLibFiles: Map<string, ts.SourceFile>,
  thirdPartyLibraries: Map<string, ts.SourceFile> = new Map(),
): VirtualTypeScriptEnvironment {
  const rootFiles = Array.from(sourceFiles.keys());
  const watchHostController = createVirtualWatchHost(sourceFiles, tsLibFiles, thirdPartyLibraries);
  const languageServiceHostController = createVirtualLanguageServiceHost(
    sourceFiles,
    tsLibFiles,
    thirdPartyLibraries,
    watchHostController.watchHost,
  );
  const languageService = ts.createLanguageService(languageServiceHostController.languageServiceHost);
  const program = languageService.getProgram()!;
  const watchProgram = ts.createWatchProgram({
    ...watchHostController.watchHost,
    rootFiles,
    options: compilerOptions,
  });
  const updateFile = (sourceFile: ts.SourceFile) => {
    languageServiceHostController.updateFile(sourceFile);
    watchHostController.updateFile(sourceFile);
  };

  const diagnostics = languageService.getCompilerOptionsDiagnostics();
  if (diagnostics.length) {
    throw new Error(ts.formatDiagnostics(diagnostics, watchHostController.watchHost));
  }

  return {
    watchProgram,
    languageService,
    typeChecker: program.getTypeChecker(),
    updateFile,
    updateFileFromText: (fileName, content, prevTextSpan) => {
      const prevSourceFile = program.getSourceFile(fileName)!;
      const prevFullContents = prevSourceFile.text;
      const newText = prevFullContents.slice(0, prevTextSpan.start)
        + content
        + prevFullContents.slice(prevTextSpan.start + prevTextSpan.length);
      const newSourceFile = ts.updateSourceFile(prevSourceFile, newText, { span: prevTextSpan, newLength: content.length });
      updateFile(newSourceFile);
    },
  };
}
