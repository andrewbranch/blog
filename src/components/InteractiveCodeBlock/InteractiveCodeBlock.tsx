import React, { useState, useMemo } from 'react';
import { Editor, EditorProps, EventHook } from 'slate-react';
import { List } from 'immutable';
import { Value, NodeJSON, Operation, Decoration, Point, Mark, Node, Text, Document } from 'slate';
import { Global, css } from '@emotion/core';
import { commonBlockStyles } from './themes';
import { Tokenizer, CacheableLineTokens } from './tokenizers/types';
import { Token } from './tokenizers/token';
import 'requestidlecallback';
import { shallowEqualIgnoringFunctions } from '../../utils/shallowEqualIgnoringFunctions';

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

  function decorateDocument(node: Document): List<Decoration> {
    if (tokenizer.tokenizeDocument) {
      const blocks = node.getBlocks();
      const fullText = blocks.map(line => line!.text).join('\n');
      return tokenizer.tokenizeDocument(fullText).reduce((decorations, line, index) => {
        const block = blocks.get(index);
        const textNode = block.getTexts().get(0);
        return decorations.concat(decorateLine(textNode, line)) as List<Decoration>;
      }, Decoration.createList());
    }
    return Decoration.createList();
  }

  function decorateNode(node: Node): List<Decoration> {
    if (node.object === 'document' && tokenizer.tokenizeDocument) {
      return decorateDocument(node);
    }
    if (node.object === 'block' && node.type === 'line' && tokenizer.tokenizeLine) {
      const textNode = node.getTexts().get(0);
      return decorateLine(textNode, tokenizer.tokenizeLine(textNode.text));
    }
    return Decoration.createList();
  }

  return { decorateDocument, decorateLine, decorateNode };
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
  onChange?: (value: string, operations: List<Operation>) => void;
  onClick?: EventHook;
  className?: string;
  padding: number | string;
  readOnly?: boolean;
  css?: React.DOMAttributes<any>['css'];
}

let callbackId: number;

function InteractiveCodeBlock<
  TokenTypeT extends string,
  ScopeNameT extends string,
  TokenT extends Token<TokenTypeT, ScopeNameT>
>(props: InteractiveCodeBlockProps<TokenTypeT, ScopeNameT, TokenT>) {
  const { decorateDocument, decorateNode } = useMemo(() => createNodeDecorator(props.tokenizer), [props.tokenizer]);
  const decorateValue = useMemo(() => {
    return (value: Value) => value.set('decorations', decorateDocument(value.document)) as Value;
  }, [decorateDocument]);
  const decorateLineSync = useMemo(() => (node: Node, _: any, next: () => any) => {
    if (node.object === 'block' && node.type === 'line') {
      return decorateNode(node);
    }
    return next();
  }, [decorateNode]);
  const [state, setState] = useState(() => decorateValue(createValueFromString(props.initialValue)));
  const renderMark = useMemo(() => createMarkRenderer(props.renderToken), [props.renderToken]);
  const globalStyles = useMemo(() => css({
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
  }), [props.padding]);

  return (
    <>
      <Global styles={globalStyles} />
      <Editor
        value={state}
        onChange={({ value, operations }) => {
          if (props.onChange) {
            props.onChange(value.document.getTexts().map(t => t!.text).join('\n'), operations);
          }

          setState(value);
          cancelIdleCallback(callbackId);
          callbackId = requestIdleCallback(() => {
            const x = value.set('decorations', decorateDocument(value.document)) as Value;
            setState(x);
          });
        }}
        renderMark={renderMark}
        decorateNode={decorateLineSync}
        className={props.className}
        onClick={props.onClick}
        css={commonBlockStyles}
        spellCheck={false}
        autoCorrect={false}
        readOnly={props.readOnly}
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

const MemoizedInteractiveCodeBlock = React.memo(
  InteractiveCodeBlock,
  shallowEqualIgnoringFunctions) as any as typeof InteractiveCodeBlock;
export { MemoizedInteractiveCodeBlock as InteractiveCodeBlock };
