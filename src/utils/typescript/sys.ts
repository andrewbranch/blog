import ts from 'typescript';
const AUDIT = false;

function notImplemented(methodName: string): any {
  throw new Error(`Method '${methodName}' is not implemented.`);
}

function audit<ArgsT extends any[], ReturnT>(
  name: string,
  fn: (...args: ArgsT) => ReturnT,
): (...args: ArgsT) => ReturnT {
  return (...args) => {
    if (AUDIT) {
      // tslint:disable-next-line:no-console
      console.log(name, ...args);
    }
    return fn(...args);
  };
}

export function createSystem(files: Map<string, string>): ts.System {
  files = new Map(files);
  return {
    args: [],
    createDirectory: () => notImplemented('createDirectory'),
    // TODO: could make a real file tree
    directoryExists: audit('directoryExists', directory => {
      return Array.from(files.keys()).some(path => path.startsWith(directory));
    }),
    exit: () => notImplemented('exit'),
    fileExists: audit('fileExists', fileName => files.has(fileName)),
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getExecutingFilePath: () => notImplemented('getExecutingFilePath'),
    readDirectory: audit('readDirectory', directory => directory === '/' ? Array.from(files.keys()) : []),
    readFile: audit('readFile', fileName => files.get(fileName)),
    resolvePath: path => path,
    newLine: '\n',
    useCaseSensitiveFileNames: true,
    write: () => notImplemented('write'),
    writeFile: (fileName, contents) => {
      files.set(fileName, contents);
    },
  };
}
