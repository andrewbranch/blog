import * as vsctm from 'vscode-textmate';

declare module 'vscode-textmate' {
  const getOnigasm: vsctm.RegistryOptions['getOnigLib'];
}