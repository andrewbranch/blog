import React from 'react';
import { css, SerializedStyles } from '@emotion/core';
import { type, variables } from '../../styles/utils';
import { SyntacticColors } from './themes';

export interface TypeScriptQuickInfoProps extends React.HTMLAttributes<HTMLSpanElement> {
  info?: import('typescript').QuickInfo;
}

// Copied to avoid async import
enum SymbolDisplayPartKind {
  aliasName = 0,
  className = 1,
  enumName = 2,
  fieldName = 3,
  interfaceName = 4,
  keyword = 5,
  lineBreak = 6,
  numericLiteral = 7,
  stringLiteral = 8,
  localName = 9,
  methodName = 10,
  moduleName = 11,
  operator = 12,
  parameterName = 13,
  propertyName = 14,
  punctuation = 15,
  space = 16,
  text = 17,
  typeParameterName = 18,
  enumMemberName = 19,
  functionName = 20,
  regularExpressionLiteral = 21,
}

export const TypeScriptQuickInfo = React.forwardRef<HTMLElement, TypeScriptQuickInfoProps>(
  ({ info, ...props }, forwardedRef) => {
    return info ? (
      <span css={type.mono} {...props} ref={forwardedRef}>
        {info.displayParts && info.displayParts.map((part, index) => (
          <span
            key={index}
            css={defaultStyles[SymbolDisplayPartKind[part.kind as any] as unknown as SymbolDisplayPartKind]}
          >
            {part.text}
          </span>
        ))}
      </span>
    ) : null;
  },
);

const defaultStyles: Record<import('typescript').SymbolDisplayPartKind, SerializedStyles | {}> = {
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
