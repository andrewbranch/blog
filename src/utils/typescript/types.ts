import ts from 'typescript';

export enum Extra {
  DOM = 'dom',
  React = 'react',
}

export interface ExtraLibFile {
  moduleName: Extra;
  modulePath: string;
  getSourceFiles: () => Promise<ts.SourceFile[]>;
}

export interface Libraries {
  core: Map<string, ts.SourceFile>;
  extra: { [K in Extra]: ExtraLibFile; };
}
