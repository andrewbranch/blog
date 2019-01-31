import ts from 'typescript';

export enum ThirdPartyLib {
  React = 'react',
}

export interface ThirdPartyLibraryFile {
  moduleName: ThirdPartyLib;
  modulePath: string;
  getTypingsSourceFile: () => Promise<ts.SourceFile>;
}

export interface Libraries {
  ts: Map<string, ts.SourceFile>;
  extra: { [K in ThirdPartyLib]: ThirdPartyLibraryFile; };
}
