/// <reference types="@types/node" />
import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { ThirdPartyLibraryFile, ThirdPartyLib, Libraries } from './types';

export const tsLibFiles = new Map<string, ts.SourceFile>([
  ['/lib.es5.d.ts', ts.createSourceFile(
    '/lib.es5.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es5.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.d.ts', ts.createSourceFile(
    '/lib.es2015.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.core.d.ts', ts.createSourceFile(
    '/lib.es2015.core.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.core.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.collection.d.ts', ts.createSourceFile(
    '/lib.es2015.collection.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.collection.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.generator.d.ts', ts.createSourceFile(
    '/lib.es2015.generator.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.generator.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.promise.d.ts', ts.createSourceFile(
    '/lib.es2015.promise.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.promise.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.iterable.d.ts', ts.createSourceFile(
    '/lib.es2015.iterable.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.iterable.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.proxy.d.ts', ts.createSourceFile(
    '/lib.es2015.proxy.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.proxy.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.reflect.d.ts', ts.createSourceFile(
    '/lib.es2015.reflect.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.reflect.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.symbol.d.ts', ts.createSourceFile(
    '/lib.es2015.symbol.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.symbol.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
  ['/lib.es2015.symbol.wellknown.d.ts', ts.createSourceFile(
    '/lib.es2015.symbol.wellknown.d.ts',
    // tslint:disable-next-line:max-line-length
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  )],
]);

const reactLibraryFile: ThirdPartyLibraryFile = {
  moduleName: ThirdPartyLib.React,
  modulePath: '/node_modules/react/index.js',
  getTypingsSourceFile: async () => ts.createSourceFile(
    '/node_modules/@types/react/index.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/@types/react/index.d.ts'), 'utf8'),
    ts.ScriptTarget.ES2015,
  ),
};

export const lib: Libraries = {
  ts: tsLibFiles,
  extra: {
    [ThirdPartyLib.React]: reactLibraryFile,
  },
};
