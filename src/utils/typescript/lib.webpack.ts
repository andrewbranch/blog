import ts from 'typescript';
import { ExtraLibFile, Extra, Libraries } from './types';

const tsLibFiles = new Map<string, ts.SourceFile>([
  ['/lib.es5.d.ts', ts.createSourceFile(
    '/lib.es5.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es5.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.d.ts', ts.createSourceFile(
    '/lib.es2015.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.core.d.ts', ts.createSourceFile(
    '/lib.es2015.core.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.core.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.collection.d.ts', ts.createSourceFile(
    '/lib.es2015.collection.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.collection.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.generator.d.ts', ts.createSourceFile(
    '/lib.es2015.generator.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.generator.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.promise.d.ts', ts.createSourceFile(
    '/lib.es2015.promise.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.promise.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.iterable.d.ts', ts.createSourceFile(
    '/lib.es2015.iterable.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.iterable.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.proxy.d.ts', ts.createSourceFile(
    '/lib.es2015.proxy.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.proxy.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.reflect.d.ts', ts.createSourceFile(
    '/lib.es2015.reflect.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.reflect.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.symbol.d.ts', ts.createSourceFile(
    '/lib.es2015.symbol.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.symbol.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.symbol.wellknown.d.ts', ts.createSourceFile(
    '/lib.es2015.symbol.wellknown.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
]);

const domLibFile: ExtraLibFile = {
  moduleName: Extra.DOM,
  modulePath: '/lib.dom.d.ts',
  getSourceFiles: async () => [ts.createSourceFile(
    '/lib.dom.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.dom.d.ts'),
    ts.ScriptTarget.ES2015,
  )],
};

const reactLibFile: ExtraLibFile = {
  moduleName: Extra.React,
  modulePath: '/node_modules/@types/react/index.d.ts',
  getSourceFiles: async () => [ts.createSourceFile(
    '/node_modules/@types/react/index.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    (await import('!raw-loader!@types/react/index.d.ts')).default,
    ts.ScriptTarget.ES2015,
  ), ts.createSourceFile(
    '/node_modules/@types/react/global.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    (await import('!raw-loader!@types/react/global.d.ts')).default,
    ts.ScriptTarget.ES2015,
  )],
};

export const lib: Libraries = {
  core: tsLibFiles,
  extra: {
    [Extra.DOM]: domLibFile,
    [Extra.React]: reactLibFile,
  },
};
