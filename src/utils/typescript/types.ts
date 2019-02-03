export enum Extra {
  DOM = 'dom',
  React = 'react',
}

export interface ExtraLibFile {
  moduleName: Extra;
  modulePath: string;
  getFiles: () => Promise<Map<string, string>>;
}

export interface Libraries {
  core: Map<string, string>;
  extra: { [K in Extra]: ExtraLibFile; };
}
