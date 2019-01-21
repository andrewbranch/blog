import React, { useState, useMemo } from 'react';
import { Editor, EditorProps } from 'slate-react';
import { Value, PointProperties, MarkProperties, NodeJSON } from 'slate';
import { Global, ClassNames } from '@emotion/core';
import { commonBlockStyles } from './themes';
import { Token } from './tokenizers';

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

export type TokenStyles<TokenTypeT extends string> = {
  [K in TokenTypeT]?: React.CSSProperties & { [key: string]: string | number }
};

function createMarkRenderer<TokenTypeT extends string>(
  tokenStyles: TokenStyles<TokenTypeT>,
  renderToken: InteractiveCodeBlockProps<TokenTypeT>['renderToken'],
) {
  const renderMark: EditorProps['renderMark'] = props => {
    return (
      <ClassNames>
        {({ css }) => renderToken(props.mark.data.get('token'), {
          children: props.children,
          className: css(tokenStyles[props.mark.type as TokenTypeT]),
        })}
      </ClassNames>
    );
  };

  return renderMark;
}

function createNodeDecorator<TokenTypeT extends string>(tokenize: (text: string) => Token<TokenTypeT>[]) {
  const decorateNode: EditorProps['decorateNode'] = (node, _, next) => {
    if (node.object !== 'document') {
      return next();
    }
    const texts = node.getTextsAsArray();
    const textStrings = texts.map(text => text.text);
    const fullText = textStrings.join('\n');
    const decorations: { anchor: PointProperties, focus: PointProperties, mark: MarkProperties }[] = [];
    let lastTextIndex = 0;
    const consumedLengthByLine: number[] = [];
    for (const token of tokenize(fullText)) {
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
        mark: { type: token.type, data: { token } },
      });
    }

    return decorations;
  };

  return decorateNode;
}

interface InjectedTokenProps {
  className: string;
  children: React.ReactNode;
}

export interface InteractiveCodeBlockProps<TokenTypeT extends string> {
  tokenTypes: TokenTypeT[];
  tokenize: (text: string) => Token<TokenTypeT>[];
  tokenStyles: TokenStyles<TokenTypeT>;
  renderToken: (token: Token<TokenTypeT>, props: InjectedTokenProps) => JSX.Element;
  initialValue: string;
  className?: string;
  padding: number | string;
  css?: React.DOMAttributes<any>['css'];
}

export function InteractiveCodeBlock<TokenTypeT extends string>(props: InteractiveCodeBlockProps<TokenTypeT>) {
  const [state, setState] = useState(createValueFromString(props.initialValue));
  const decorateNode = useMemo(() => createNodeDecorator(props.tokenize), [props.tokenize]);
  const renderMark = useMemo(() => createMarkRenderer(props.tokenStyles, props.renderToken), [props.tokenStyles]);
  return (
    <>
      <Global
        styles={{
          '[data-slate-leaf]:last-child': {
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'relative',
              top: 0,
              right: typeof props.padding === 'string' ? `-${props.padding}` : -props.padding,
              width: props.padding,
            },
          },
        }}
      />
      <Editor
        value={state}
        onChange={({ value }) => setState(value)}
        renderMark={renderMark}
        decorateNode={decorateNode}
        className={props.className}
        css={commonBlockStyles}
        spellCheck={false}
        style={{ whiteSpace: 'nowrap', padding: props.padding }}
      />
    </>
  );
}

const defaultProps: Pick<InteractiveCodeBlockProps<any>, 'padding' | 'tokenStyles' | 'renderToken'> = {
  padding: 20,
  tokenStyles: {},
  renderToken: (_, props) => <span {...props} />,
};

InteractiveCodeBlock.defaultProps = defaultProps;
