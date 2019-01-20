import React, { useState } from 'react';
import { Editor, EditorProps } from 'slate-react';
import { Value, PointProperties, MarkProperties, NodeJSON } from 'slate';

function createValueFromString(text: string): Value {
  return Value.fromJSON({
    document: {
      nodes: text.split('\n').map((line): NodeJSON => ({
        object: 'block',
        type: 'line',
        nodes: [{
          object: 'text',
          leaves: [{
            object: 'leaf',
            text: line,
          }],
        }],
      })),
    },
  });
}

type MarkRenderer = EditorProps['renderMark'];
export type TokenStyles<TokenTypeT extends string> = { [K in TokenTypeT]?: React.CSSProperties };

function createMarkRenderer<TokenTypeT extends string>(tokenStyles: TokenStyles<TokenTypeT>) {
  const renderMark: MarkRenderer = props => {
    return <span css={tokenStyles[props.mark.type as TokenTypeT] as any}>{props.children}</span>;
  };

  return renderMark;
}

export interface Token<TokenTypeT extends string> {
  type: TokenTypeT;
  start: number;
  end: number;
}

export interface InteractiveCodeBlockProps<TokenTypeT extends string> {
  tokenTypes: TokenTypeT[];
  tokenize: (text: string) => Token<TokenTypeT>[];
  tokenStyles: TokenStyles<TokenTypeT>;
  initialValue: string;
}

export function InteractiveCodeBlock<TokenTypeT extends string>(props: InteractiveCodeBlockProps<TokenTypeT>) {
  const [state, setState] = useState(createValueFromString(props.initialValue));
  return (
    <Editor
      value={state}
      onChange={({ value }) => setState(value)}
      renderMark={createMarkRenderer(props.tokenStyles)}
      decorateNode={(node, _, next) => {
        if (node.object !== 'document') {
          return next();
        }
        const texts = node.getTextsAsArray();
        const textStrings = texts.map(text => text.text);
        const fullText = textStrings.join('\n');
        const decorations: { anchor: PointProperties, focus: PointProperties, mark: MarkProperties }[] = [];
        let lastTextIndex = 0;
        const consumedLengthByLine: number[] = [];
        for (const token of props.tokenize(fullText)) {
          let startPoint: PointProperties | undefined;
          let endPoint: PointProperties | undefined;
          for (let i = lastTextIndex; i < texts.length; i++) {
            const text = texts[i];
            const textString = text.text;
            const consumedLength = consumedLengthByLine[i - 1] || 0;
            if (!startPoint && token.start >= consumedLength && token.start <= consumedLength + textString.length) {
              lastTextIndex = i;
              startPoint = {
                key: text.key,
                offset: token.start - consumedLength,
              };
            }
            if (!endPoint && token.end >= consumedLength && token.end <= consumedLength + textString.length) {
              endPoint = {
                key: text.key,
                offset: token.end - consumedLength,
              };
            }
            if (!consumedLengthByLine[i]) {
              consumedLengthByLine[i] = consumedLength + textString.length + 1;
            }
            if (startPoint && endPoint) {
              break;
            }
          }
          if (!startPoint || !endPoint) {
            throw new Error(`Invalid range found for token of type ${token.type}: [${token.start}, ${token.end}]`);
          }

          decorations.push({
            anchor: startPoint,
            focus: endPoint,
            mark: { type: token.type },
          });
        }

        return decorations;
      }}
    />
  );
}
