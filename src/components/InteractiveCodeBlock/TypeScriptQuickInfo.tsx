import React from 'react';
import ts, { SymbolDisplayPartKind } from 'typescript';
import { type, variables } from '../../styles/utils';

export interface TypeScriptQuickInfoProps extends React.HTMLAttributes<HTMLSpanElement> {
  info?: ts.QuickInfo;
  partStyles: Partial<Record<ts.SymbolDisplayPartKind, React.CSSProperties & { [key: string]: string | number }>>;
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

const defaultStyles: TypeScriptQuickInfoProps['partStyles'] = {
  [SymbolDisplayPartKind.interfaceName]: { color: '#267f99' },
  [SymbolDisplayPartKind.punctuation]: { color: variables.colors.text.secondary },
  [SymbolDisplayPartKind.keyword]: { color: '#0000ff' },
  [SymbolDisplayPartKind.propertyName]: { color: '#001080' },
};

TypeScriptQuickInfo.defaultProps = { partStyles: defaultStyles };
