import ts from 'typescript';

const defaultCompilerOptions = {
  ...ts.getDefaultCompilerOptions(),
  jsx: ts.JsxEmit.React,
  strict: true,
  target: ts.ScriptTarget.ES2015,
  esModuleInterop: true,
  module: ts.ModuleKind.ESNext,
  suppressOutputPathCheck: true,
  skipLibCheck: true,
  skipDefaultLibCheck: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
};

const defaultLibFileName = '/lib.es2015.d.ts';

export function createVirtualCompilerHost(
  sys: ts.System,
  compilerOptions: ts.CompilerOptions,
): {
  compilerHost: ts.CompilerHost,
  updateFile: (sourceFile: ts.SourceFile) => boolean,
} {
  const sourceFiles = new Map<string, ts.SourceFile>();
  const save = (sourceFile: ts.SourceFile) => {
    sourceFiles.set(sourceFile.fileName, sourceFile);
    return sourceFile;
  };

  return {
    compilerHost: {
      ...sys,
      getCanonicalFileName: fileName => fileName,
      getDefaultLibFileName: () => defaultLibFileName,
      getDirectories: () => [],
      getNewLine: () => sys.newLine,
      getSourceFile: fileName => {
        return sourceFiles.get(fileName) || save(ts.createSourceFile(
          fileName,
          sys.readFile(fileName)!,
          compilerOptions.target || defaultCompilerOptions.target,
          false,
        ));
      },
      useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
    },
    updateFile: sourceFile => {
      const alreadyExists = sourceFiles.has(sourceFile.fileName);
      sys.writeFile(sourceFile.fileName, sourceFile.text);
      sourceFiles.set(sourceFile.fileName, sourceFile);
      return alreadyExists;
    },
  };
}

export function createVirtualLanguageServiceHost(
  sys: ts.System,
  rootFiles: string[],
  compilerOptions: ts.CompilerOptions,
): {
  languageServiceHost: ts.LanguageServiceHost,
  updateFile: (sourceFile: ts.SourceFile) => void,
} {
  const fileNames = [...rootFiles];
  const { compilerHost, updateFile } = createVirtualCompilerHost(sys, compilerOptions);
  const fileVersions = new Map<string, string>();
  let projectVersion = 0;
  const languageServiceHost: ts.LanguageServiceHost = {
    ...compilerHost,
    getProjectVersion: () => projectVersion.toString(),
    getCompilationSettings: () => compilerOptions,
    getScriptFileNames: () => fileNames,
    getScriptSnapshot: fileName => {
      const contents = sys.readFile(fileName);
      if (contents) {
        return ts.ScriptSnapshot.fromString(contents);
      }
    },
    getScriptVersion: fileName => {
      return fileVersions.get(fileName) || '0';
    },
    writeFile: sys.writeFile,
  };

  return {
    languageServiceHost,
    updateFile: sourceFile => {
      projectVersion++;
      fileVersions.set(sourceFile.fileName, projectVersion.toString());
      if (!fileNames.includes(sourceFile.fileName)) {
        fileNames.push(sourceFile.fileName);
      }
      updateFile(sourceFile);
    },
  };
}

export interface VirtualTypeScriptEnvironment {
  sys: ts.System;
  languageService: ts.LanguageService;
  createFile: (fileName: string, content: string) => void;
  updateFile: (fileName: string, content: string, replaceTextSpan: ts.TextSpan) => void;
}

export function createVirtualTypeScriptEnvironment(
  sys: ts.System,
  rootFiles: string[],
  compilerOptions: ts.CompilerOptions = {},
): VirtualTypeScriptEnvironment {
  const mergedCompilerOptions = {
    ...defaultCompilerOptions,
    ...compilerOptions,
    lib: compilerOptions
      && compilerOptions.lib
      && compilerOptions.lib.map(lib => `/lib.${lib}.d.ts`).concat(defaultLibFileName),
  };
  const { languageServiceHost, updateFile } = createVirtualLanguageServiceHost(
    sys,
    rootFiles,
    mergedCompilerOptions,
  );

  const languageService = ts.createLanguageService(languageServiceHost);
  const diagnostics = languageService.getCompilerOptionsDiagnostics();
  if (diagnostics.length) {
    throw new Error(ts.formatDiagnostics(diagnostics, {
      getCurrentDirectory: sys.getCurrentDirectory,
      getNewLine: () => sys.newLine,
      getCanonicalFileName: fileName => fileName,
    }));
  }

  return {
    sys,
    languageService,
    createFile: (fileName, content) => {
      updateFile(ts.createSourceFile(fileName, content, mergedCompilerOptions.target, false));
    },
    updateFile: (fileName, content, prevTextSpan) => {
      const prevSourceFile = languageService.getProgram()!.getSourceFile(fileName)!;
      const prevFullContents = prevSourceFile.text;
      const newText = prevFullContents.slice(0, prevTextSpan.start)
        + content
        + prevFullContents.slice(prevTextSpan.start + prevTextSpan.length);
      const newSourceFile = ts.updateSourceFile(
        prevSourceFile,
        newText,
        { span: prevTextSpan, newLength: content.length },
      );

      updateFile(newSourceFile);
    },
  };
}
