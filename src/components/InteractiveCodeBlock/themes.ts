import ts from 'typescript';
import { TokenStyles } from './InteractiveCodeBlock';
import { PrismTokenType } from './tokenizers/prism';
import './themes.css';

export interface InteractiveCodeBlockTheme<ScopeNameT extends string> {
  tokens: TokenStyles<ScopeNameT>;
  block: React.CSSProperties & { [key: string]: string | number };
}

export enum SyntacticColors {
  Function = '#795E26',
  Types = '#267f99',
  ControlFlow = '#AF00DB',
  VariableName = '#001080',
  RegExp = '#d16969',
  Comment = '#008000',
  Keyword = '#0000ff',
  Numeric = '#09885a',
  String = '#a31515',
  Property = '#0451a5',
  Punctuation = '#000000',
  Operator = '#000000',
}

export const commonBlockStyles: React.CSSProperties & { [key: string]: string | number } = {
  fontFamily: 'monospace',
  fontSize: '90%',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 3,
  overflow: 'auto',
  whiteSpace: 'nowrap',
};

export const typeScriptVSCode: InteractiveCodeBlockTheme<ts.ClassificationTypeNames> = {
  tokens: {
    [ts.ClassificationTypeNames.bigintLiteral]: { color: SyntacticColors.Numeric },
    [ts.ClassificationTypeNames.className]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.comment]: { color: SyntacticColors.Comment },
    [ts.ClassificationTypeNames.docCommentTagName]: { color: SyntacticColors.Keyword },
    [ts.ClassificationTypeNames.enumName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.identifier]: { color: SyntacticColors.VariableName },
    [ts.ClassificationTypeNames.interfaceName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.jsxAttribute]: { color: SyntacticColors.Property },
    [ts.ClassificationTypeNames.jsxAttributeStringLiteralValue]: { color: SyntacticColors.String },
    [ts.ClassificationTypeNames.jsxCloseTagName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.jsxOpenTagName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.jsxSelfClosingTagName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.jsxText]: {},
    [ts.ClassificationTypeNames.keyword]: { color: SyntacticColors.Keyword },
    [ts.ClassificationTypeNames.moduleName]: {},
    [ts.ClassificationTypeNames.numericLiteral]: { color: SyntacticColors.Numeric },
    [ts.ClassificationTypeNames.operator]: { color: SyntacticColors.Punctuation },
    [ts.ClassificationTypeNames.parameterName]: { color: SyntacticColors.VariableName },
    [ts.ClassificationTypeNames.punctuation]: { color: SyntacticColors.Punctuation },
    [ts.ClassificationTypeNames.stringLiteral]: { color: SyntacticColors.String },
    [ts.ClassificationTypeNames.text]: {},
    [ts.ClassificationTypeNames.typeAliasName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.typeParameterName]: { color: SyntacticColors.Types },
    [ts.ClassificationTypeNames.whiteSpace]: {},
  },
  block: {},
};

export const prismVSCode: InteractiveCodeBlockTheme<PrismTokenType> = {
  tokens: {
    [PrismTokenType.Boolean]: { color: SyntacticColors.Keyword },
    [PrismTokenType.Builtin]: { color: SyntacticColors.VariableName },
    [PrismTokenType.ClassName]: { color: SyntacticColors.Types },
    [PrismTokenType.Comment]: { color: SyntacticColors.Comment },
    [PrismTokenType.Constant]: { color: SyntacticColors.VariableName },
    [PrismTokenType.Function]: { color: SyntacticColors.Function },
    [PrismTokenType.FunctionVariable]: { color: SyntacticColors.Function },
    [PrismTokenType.Keyword]: { color: SyntacticColors.Keyword },
    [PrismTokenType.Number]: { color: SyntacticColors.Numeric },
    [PrismTokenType.Operator]: { color: SyntacticColors.Operator },
    [PrismTokenType.Punctuation]: { color: SyntacticColors.Punctuation },
    [PrismTokenType.RegExp]: { color: SyntacticColors.RegExp },
    [PrismTokenType.String]: { color: SyntacticColors.String },
    [PrismTokenType.Type]: { color: SyntacticColors.Keyword },
  },
  block: {},
};
