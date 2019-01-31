import React from 'react';
import ts, { SymbolDisplayPartKind } from 'typescript';
import { css, SerializedStyles, ObjectInterpolation } from '@emotion/core';
import { type, variables } from '../../styles/utils';
import { SyntacticColors } from './themes';

export interface TypeScriptQuickInfoProps extends React.HTMLAttributes<HTMLSpanElement> {
  info?: ts.QuickInfo;
  partStyles: Partial<Record<ts.SymbolDisplayPartKind, SerializedStyles | ObjectInterpolation<any>>>;
}

export function TypeScriptQuickInfo({ info, partStyles, ...props }: TypeScriptQuickInfoProps) {
  return info ? (
    <span css={type.mono} {...props}>
      {info.displayParts && info.displayParts.map((part, index) => (
        <span
          key={index}
          css={partStyles[ts.SymbolDisplayPartKind[part.kind as any] as unknown as ts.SymbolDisplayPartKind]}
        >
          {part.text}
        </span>
      ))}
    </span>
  ) : null;
}

const defaultStyles: Required<TypeScriptQuickInfoProps['partStyles']> = {
  [SymbolDisplayPartKind.interfaceName]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.enumName]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.className]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.punctuation]: css({ color: SyntacticColors.Punctuation }),
  [SymbolDisplayPartKind.keyword]: css({ color: SyntacticColors.Keyword }),
  [SymbolDisplayPartKind.propertyName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.enumMemberName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.aliasName]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.fieldName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.methodName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.functionName]: css({ color: SyntacticColors.Function }),
  [SymbolDisplayPartKind.localName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.moduleName]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.numericLiteral]: css({ color: SyntacticColors.Numeric }),
  [SymbolDisplayPartKind.operator]: css({ color: SyntacticColors.Operator }),
  [SymbolDisplayPartKind.parameterName]: css({ color: SyntacticColors.VariableName }),
  [SymbolDisplayPartKind.regularExpressionLiteral]: css({ color: SyntacticColors.RegExp }),
  [SymbolDisplayPartKind.stringLiteral]: css({ color: SyntacticColors.String }),
  [SymbolDisplayPartKind.typeParameterName]: css({ color: SyntacticColors.Types }),
  [SymbolDisplayPartKind.text]: css({ color: variables.colors.text.secondary }),
  [SymbolDisplayPartKind.space]: {},
  [SymbolDisplayPartKind.lineBreak]: {},
};

TypeScriptQuickInfo.defaultProps = { partStyles: defaultStyles };
