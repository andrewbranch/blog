import React, { useState, useMemo } from 'react';
import { Editor, EditorProps } from 'slate-react';
import { List } from 'immutable';
import { Value, NodeJSON, Operation, Decoration, Point, Mark, Editor as CoreEditor, Node } from 'slate';
import { Global } from '@emotion/core';
import { commonBlockStyles } from './themes';
import { Token, Tokenizer } from './tokenizers';

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
  renderToken: InteractiveCodeBlockProps<TokenTypeT, any>['renderToken'],
) {
  const renderMark: EditorProps['renderMark'] = props => {
    return renderToken(props.mark.data.get('token'), {
      children: props.children,
      style: tokenStyles[props.mark.type as TokenTypeT],
    });
  };

  return renderMark;
}

function createNodeDecorator<TokenT extends Token<string>>(
  tokenize: InteractiveCodeBlockProps<any, TokenT>['tokenize'],
) {
  const lineCache = new WeakMap<Node, Map<string, List<Decoration>>>();
  function decorateNode(node: Node, _: CoreEditor, next: () => any) {
    if (node.object !== 'document') {
      return next();
    }

    const blocks = node.getBlocks();
    const fullText = blocks.map(line => line!.text).join('\n');
    return blocks.reduce((decorations, block, index) => {
      const textNode = block!.getTexts().get(0);
      const decorationsForLineCache = lineCache.get(textNode) || new Map<string, List<Decoration>>();
      const { hash, tokens } = tokenize(fullText, index!);
      const decorationsForLine = decorationsForLineCache.get(hash);
      if (decorationsForLine) {
        return decorations!.concat(decorationsForLine) as List<Decoration>;
      }
      decorationsForLineCache.clear();
      const newDecorations = tokens.reduce((decs, token) => decs.push(Decoration.create({
        anchor: {
          key: textNode.key,
          offset: token.start,
        } as Point,
        focus: {
          key: textNode.key,
          offset: token.end,
        } as Point,
        mark: Mark.create({
          type: token.type,
          data: { token },
        }),
      })), Decoration.createList());
      decorationsForLineCache.set(hash, newDecorations);
      lineCache.set(textNode, decorationsForLineCache);
      return decorations!.concat(newDecorations) as List<Decoration>;
    }, Decoration.createList());
  }

  return decorateNode;
}

interface InjectedTokenProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface InteractiveCodeBlockProps<TokenTypeT extends string, TokenT extends Token<TokenTypeT>> {
  tokenize: Tokenizer<TokenT>['tokenize'];
  tokenStyles: TokenStyles<TokenTypeT>;
  renderToken: (token: TokenT, props: InjectedTokenProps) => JSX.Element;
  initialValue: string;
  onChange?: (value: string, operations: Operation[]) => void;
  className?: string;
  padding: number | string;
  css?: React.DOMAttributes<any>['css'];
}

export function InteractiveCodeBlock<
  TokenTypeT extends string,
  TokenT extends Token<TokenTypeT>
>(props: InteractiveCodeBlockProps<TokenTypeT, TokenT>) {
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
        onChange={({ value, operations }) => {
          if (props.onChange) {
            props.onChange(value.document.getTexts().map(t => t!.text).join('\n'), operations.toArray());
          }

          setState(value);
        }}
        renderMark={renderMark}
        decorateNode={decorateNode}
        className={props.className}
        css={commonBlockStyles}
        spellCheck={false}
        style={{ wordWrap: 'normal', whiteSpace: 'pre', padding: props.padding }}
      />
    </>
  );
}

const defaultProps: Pick<InteractiveCodeBlockProps<any, any>, 'padding' | 'tokenStyles' | 'renderToken'> = {
  padding: 20,
  tokenStyles: {},
  renderToken: (_, props) => <span {...props} />,
};

InteractiveCodeBlock.defaultProps = defaultProps;
