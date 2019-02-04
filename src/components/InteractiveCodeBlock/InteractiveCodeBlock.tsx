import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Editor, EditorProps } from 'slate-react';
import { css } from '@emotion/core';
import { List } from 'immutable';
import { Value, NodeJSON, Operation, Decoration, Point, Mark, Node, Text, Document } from 'slate';
import { commonBlockStyles } from './themes';
import { Tokenizer, CacheableLineTokens } from './tokenizers/types';
import { Token } from './tokenizers/token';
import 'requestidlecallback';
import { rhythm } from '../../utils/typography';
import { padding, Side, resets, darkMode, animations } from '../../styles/utils';
import { Icon } from '../Icon';

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

function getFullText(value: Value): string {
  return value.document.getTexts().map(t => t!.text).join('\n');
}

let callbackId: number;

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
  className?: string;
  readOnly?: boolean;
  isLoading: boolean;
  onStartEditing: () => void;
  css?: React.DOMAttributes<any>['css'];
}

const iconStyles = css({
  opacity: 0.6,
  ...darkMode({ filter: 'invert(100%)' }),
});

// tslint:disable:no-var-requires
const loadingIcon = (
  <Icon css={[iconStyles, animations.spinning]} src={require('../icons/loading.svg')} alt="Loading" />
);
const editIcon = <Icon css={iconStyles} src={require('../icons/pencil.svg')} alt="Edit" />;
const resetIcon = <Icon css={iconStyles} src={require('../icons/reset.svg')} alt="Reset" />;
const containerStyles = css([
  padding(1, Side.Left),
  padding(2, Side.Right),
  padding(0.5, Side.Vertical),
  {
    position: 'relative',
    fontSize: '1rem',
    ':hover > button': {
      opacity: 1,
    },
  },
]);

export function InteractiveCodeBlock<
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
  const { current: originalState } = useRef(state);
  const editorRef = useRef<Editor>(null);
  const plugins = useMemo(() => ([{ renderMark: createMarkRenderer(props.renderToken) }]), [props.renderToken]);
  const isChanged = props.initialValue !== getFullText(state);
  const buttonIcon = props.isLoading ? loadingIcon
    : props.readOnly ? editIcon
    : isChanged ? resetIcon
    : null;

  useEffect(() => {
    if (!props.readOnly && !props.isLoading && editorRef.current) {
      editorRef.current.focus();
    }
  }, [props.isLoading]);

  return (
    <pre css={containerStyles}>
      <Editor
        ref={editorRef}
        value={state}
        onChange={({ value, operations }) => {
          if (props.onChange) {
            props.onChange(getFullText(value), operations);
          }

          setState(value);
          cancelIdleCallback(callbackId);
          callbackId = requestIdleCallback(() => {
            const x = value.set('decorations', decorateDocument(value.document)) as Value;
            setState(x);
          });
        }}
        plugins={plugins}
        decorateNode={decorateLineSync}
        className={props.className}
        css={commonBlockStyles}
        spellCheck={false}
        autoCorrect={false}
        readOnly={props.readOnly}
        style={{ wordWrap: 'normal', whiteSpace: 'pre' }}
      />
      {buttonIcon ? (
        <Button
          css={{ opacity: buttonIcon === resetIcon ? 1 : 0}}
          disabled={props.isLoading}
          onClick={isChanged
            ? () => setTimeout(() => setState(originalState), 50)
            : () => {
              props.onStartEditing();
              if (!props.isLoading && editorRef.current) {
                editorRef.current.focus();
              }
            }
          }
          aria-label={buttonIcon.props.alt}
        >
          {buttonIcon}
        </Button>
      ) : null}
    </pre>
  );
}

const defaultProps: Pick<InteractiveCodeBlockProps<any, any, any>, 'renderToken'> = {
  renderToken: (_, props) => <span {...props} />,
};

InteractiveCodeBlock.defaultProps = defaultProps;

const buttonStyles = css([resets.unbutton], {
  padding: '4px 6px',
  borderRadius: 4,
  fontSize: 0,
  position: 'absolute',
  top: rhythm(0.5),
  right: rhythm(1),
});

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button css={buttonStyles} {...props} />
  );
}
