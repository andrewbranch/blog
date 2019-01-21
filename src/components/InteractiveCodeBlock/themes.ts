import { TokenStyles } from './InteractiveCodeBlock';
import { PrismTokenType } from './tokenizers/prism';
import { variables } from '../../styles/utils';

export interface InteractiveCodeBlockTheme<TokenTypeT extends string> {
  tokens: TokenStyles<TokenTypeT>;
  block: React.CSSProperties & { [key: string]: string | number };
}

export const commonBlockStyles: React.CSSProperties & { [key: string]: string | number } = {
  fontFamily: 'monospace',
  fontSize: '90%',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 3,
  overflow: 'auto',
  whiteSpace: 'nowrap',
};

export const prismVSCode: InteractiveCodeBlockTheme<PrismTokenType> = {
  tokens: {
    [PrismTokenType.Boolean]: { color: '#0000ff' },
    [PrismTokenType.Builtin]: { color: '#001080' },
    [PrismTokenType.ClassName]: { color: '#267f99' },
    [PrismTokenType.Comment]: { color: '#008000' },
    [PrismTokenType.Constant]: { color: '#267f99' },
    [PrismTokenType.Function]: { color: '#795e26' },
    [PrismTokenType.FunctionVariable]: { color: '#795e26' },
    [PrismTokenType.Keyword]: { color: '#0000ff' },
    [PrismTokenType.Number]: { color: '#267f99' },
    [PrismTokenType.Operator]: { color: variables.colors.text.primary },
    [PrismTokenType.Punctuation]: { color: variables.colors.text.primary },
    [PrismTokenType.RegExp]: { color: '#811f3f' },
    [PrismTokenType.String]: { color: '#a31515' },
  },
  block: {},
};
