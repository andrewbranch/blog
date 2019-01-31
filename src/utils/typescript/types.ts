import ts from 'typescript';

export enum ThirdPartyLib {
  React = 'react',
}

export interface ThirdPartyLibraryFile {
  moduleName: ThirdPartyLib;
  modulePath: string;
  typingsSourceFile: ts.SourceFile;
}

export interface Libraries {
  ts: Map<string, ts.SourceFile>;
  extra: { [K in ThirdPartyLib]: ThirdPartyLibraryFile; };
}
