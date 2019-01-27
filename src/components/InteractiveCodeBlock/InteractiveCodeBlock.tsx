import React, { useState, useMemo } from 'react';
import { Editor, EditorProps } from 'slate-react';
import { List } from 'immutable';
import { Value, NodeJSON, Operation, Decoration, Point, Mark, Editor as CoreEditor, Node, Text } from 'slate';
import { Global } from '@emotion/core';
import { commonBlockStyles } from './themes';
import { Token, Tokenizer, CacheableLineTokens } from './tokenizers';

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

export type TokenStyles<ScopeNameT extends string> = {
  [K in ScopeNameT]?: React.CSSProperties & { [key: string]: string | number }
};

function createMarkRenderer<ScopeNameT extends string>(
  renderToken: InteractiveCodeBlockProps<any, ScopeNameT, any>['renderToken'],
) {
  const renderMark: EditorProps['renderMark'] = props => {
    const token = props.mark.data.get('token') as Token<any, ScopeNameT>;
    return renderToken(token, {
      children: props.children,
    });
  };

  return renderMark;
}

function createNodeDecorator<TokenT extends Token<string, string>>(tokenizer: Tokenizer<TokenT>) {
  const lineCache = new WeakMap<Node, Map<string, List<Decoration>>>();
  function decorateLine(textNode: Text, { hash, tokens }: CacheableLineTokens<TokenT>): List<Decoration> {
    const decorationsForLineCache = lineCache.get(textNode) || new Map<string, List<Decoration>>();
    const decorationsForLine = decorationsForLineCache.get(hash);
    if (decorationsForLine) {
      return decorationsForLine;
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
    return newDecorations;
  }

  function decorateNode(node: Node, _: CoreEditor, next: () => any) {
    if (node.object === 'document' && tokenizer.tokenizeDocument) {
      const blocks = node.getBlocks();
      const fullText = blocks.map(line => line!.text).join('\n');
      return tokenizer.tokenizeDocument(fullText).reduce((decorations, line, index) => {
        const block = blocks.get(index);
        const textNode = block.getTexts().get(0);
        return decorations.concat(decorateLine(textNode, line)) as List<Decoration>;
      }, Decoration.createList());
    }
    if (node.object === 'block' && node.type === 'line' && tokenizer.tokenizeLine) {
      const textNode = node.getTexts().get(0);
      return decorateLine(textNode, tokenizer.tokenizeLine(textNode.text));
    }
    return next();
  }

  return decorateNode;
}

interface InjectedTokenProps {
  children: React.ReactNode;
}

export interface InteractiveCodeBlockProps<
  TokenTypeT extends string,
  ScopeNameT extends string,
  TokenT extends Token<TokenTypeT, ScopeNameT>
> {
  tokenizer: Tokenizer<TokenT>;
  renderToken: (token: TokenT, props: InjectedTokenProps) => JSX.Element;
  initialValue: string;
  onChange?: (value: string, operations: Operation[]) => void;
  className?: string;
  padding: number | string;
  css?: React.DOMAttributes<any>['css'];
}

export function InteractiveCodeBlock<
  TokenTypeT extends string,
  ScopeNameT extends string,
  TokenT extends Token<TokenTypeT, ScopeNameT>
>(props: InteractiveCodeBlockProps<TokenTypeT, ScopeNameT, TokenT>) {
  const [state, setState] = useState(createValueFromString(props.initialValue));
  const decorateNode = useMemo(() => createNodeDecorator(props.tokenizer), [props.tokenizer]);
  const renderMark = useMemo(() => createMarkRenderer(props.renderToken), [props.renderToken]);
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

const defaultProps: Pick<InteractiveCodeBlockProps<any, any, any>, 'padding' | 'renderToken'> = {
  padding: 20,
  renderToken: (_, props) => <span {...props} />,
};

InteractiveCodeBlock.defaultProps = defaultProps;
