/// <reference types="@types/node" />
import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { ExtraLibFile, Extra, Libraries } from './types';

export const tsLibFiles = new Map([[
    '/lib.es5.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es5.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.core.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.core.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.collection.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.collection.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.generator.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.generator.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.promise.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.promise.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.iterable.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.iterable.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.proxy.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.proxy.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.reflect.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.reflect.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.symbol.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.symbol.d.ts'), 'utf8'),
  ], [
    '/lib.es2015.symbol.wellknown.d.ts',
    // tslint:disable-next-line:max-line-length
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts'), 'utf8'),
  ],
]);

const domLibFile: ExtraLibFile = {
  moduleName: Extra.DOM,
  modulePath: '/lib.dom.d.ts',
  getFiles: async () => new Map([[
    '/lib.dom.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/typescript/lib/lib.dom.d.ts'), 'utf8'),
  ]]),
};

const reactLibFile: ExtraLibFile = {
  moduleName: Extra.React,
  modulePath: '/node_modules/@types/react/index.d.ts',
  getFiles: async () => new Map([[
    '/node_modules/@types/react/index.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/@types/react/index.d.ts'), 'utf8'),
  ], [
    '/node_modules/@types/react/global.d.ts',
    fs.readFileSync(path.resolve(__dirname, '../../../node_modules/@types/react/global.d.ts'), 'utf8'),
  ]]),
};

export const lib: Libraries = {
  core: tsLibFiles,
  extra: {
    [Extra.DOM]: domLibFile,
    [Extra.React]: reactLibFile,
  },
};
