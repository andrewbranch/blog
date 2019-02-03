import { ExtraLibFile, Extra, Libraries } from './types';

const tsLibFiles = new Map([[
    '/lib.es5.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es5.d.ts'),
  ], [
    '/lib.es2015.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.d.ts'),
  ], [
    '/lib.es2015.core.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.core.d.ts'),
  ], [
    '/lib.es2015.collection.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.collection.d.ts'),
  ], [
    '/lib.es2015.generator.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.generator.d.ts'),
  ], [
    '/lib.es2015.promise.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.promise.d.ts'),
  ], [
    '/lib.es2015.iterable.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.iterable.d.ts'),
  ], [
    '/lib.es2015.proxy.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.proxy.d.ts'),
  ], [
    '/lib.es2015.reflect.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.reflect.d.ts'),
  ], [
    '/lib.es2015.symbol.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.symbol.d.ts'),
  ], [
    '/lib.es2015.symbol.wellknown.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    require('!raw-loader!typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
  ],
]);

const domLibFile: ExtraLibFile = {
  moduleName: Extra.DOM,
  modulePath: '/lib.dom.d.ts',
  getFiles: async () => new Map([[
    '/lib.dom.d.ts',
    // tslint:disable-next-line:no-var-requires no-implicit-dependencies
    (await import('!raw-loader!typescript/lib/lib.dom.d.ts')).default,
  ]]),
};

const reactLibFile: ExtraLibFile = {
  moduleName: Extra.React,
  modulePath: '/node_modules/@types/react/index.d.ts',
  getFiles: async () => new Map([[
    '/node_modules/@types/react/index.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    (await import('!raw-loader!@types/react/index.d.ts')).default,
  ], [
    '/node_modules/@types/react/global.d.ts',
    // tslint:disable-next-line:no-implicit-dependencies
    (await import('!raw-loader!@types/react/global.d.ts')).default,
  ]]),
};

export const lib: Libraries = {
  core: tsLibFiles,
  extra: {
    [Extra.DOM]: domLibFile,
    [Extra.React]: reactLibFile,
  },
};
