import React, { HTMLAttributes, useEffect, useRef, useContext, useState, useMemo } from 'react';
import Layout from '../components/layout';
import { graphql } from 'gatsby';
import RehypeReact from 'rehype-react';
import { InteractiveCodeBlock } from '../components/InteractiveCodeBlock/InteractiveCodeBlock';
import { CacheableLineTokens, TypeScriptTokenType } from '../components/InteractiveCodeBlock/tokenizers/types';
import { useProgressiveTokenizer, ComposedTokenT } from '../hooks';
import { useDeferredRender } from '../hooks/useDeferredRender';
import { CheapCodeBlock } from '../components/CheapCodeBlock';
import { TypeScriptIdentifierToken } from '../components/InteractiveCodeBlock/TypeScriptIdentifierToken';
import { TypeScriptDiagnosticToken } from '../components/InteractiveCodeBlock/TypeScriptDiagnosticToken';
import 'katex/dist/katex.min.css';

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: { pre: ProgressiveCodeBlock },
}).Compiler;

export interface CodeBlockContext {
  id: string;
  text: string;
  fileName: string;
  start: number;
  end: number;
  tokens: CacheableLineTokens<ComposedTokenT>[];
  quickInfo: { [key: number]: import('typescript').QuickInfo };
}

export interface SourceFileFragment {
  codeBlockId: string;
}

export interface SourceFileContext {
  preamble: string;
  fragments: SourceFileFragment[];
}

export interface PostProps {
  data: {
    markdownRemark: {
      htmlAst: any;
      frontmatter: {
        title: string;
        lib: import('../utils/typescript/types').Extra[];
      };
    };
  };
  pageContext: {
    codeBlocks: {
      [key: string]: CodeBlockContext;
    };
    sourceFiles: {
      [key: string]: SourceFileContext;
    }
  };
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst,
      frontmatter {
        title,
        lib
      }
    }
  }
`;

function getStartOfCodeBlock(
  codeBlockId: string,
  codeBlocks: Record<string, CodeBlockContext>,
  sourceFileContext: SourceFileContext,
): number {
  const blockIndex = sourceFileContext.fragments.findIndex(f => f.codeBlockId === codeBlockId);
  if (blockIndex === 0) {
    return sourceFileContext.preamble.length;
  }

  const prevBlock = sourceFileContext.fragments[blockIndex - 1];
  return codeBlocks[prevBlock.codeBlockId].end + 1;
}

function ProgressiveCodeBlock(props: { children: [React.ReactElement<HTMLAttributes<HTMLElement>>] }) {
  const { editable, tsEnv, onStartEditing, mutableCodeBlocks, sourceFiles } = useContext(EditableContext);
  const codeChild: React.ReactElement<HTMLAttributes<HTMLElement>> = props.children[0];
  const id = codeChild.props.id!;
  const codeBlock = mutableCodeBlocks[id];
  const { tokens: initialTokens, quickInfo, text, fileName } = codeBlock!;
  const [span, setSpan] = useState<import('typescript').TextSpan>({
    start: codeBlock!.start,
    length: text.length,
  });

  const tokenizer = useProgressiveTokenizer({
    initialTokens,
    editable,
    languageService: tsEnv && tsEnv.languageService,
    fileName,
    visibleSpan: span,
  });
  const deferredCodeBlock = useDeferredRender(() => (
    <InteractiveCodeBlock
      className="tm-theme"
      initialValue={text}
      tokenizer={tokenizer}
      readOnly={!editable}
      onClick={() => editable || onStartEditing!()}
      onChange={value => {
        const start = getStartOfCodeBlock(id, mutableCodeBlocks, sourceFiles![codeBlock.fileName]);
        const end = start + value.length;
        const newSpan = { start, length: value.length };
        mutableCodeBlocks[id].end = end;
        if (tsEnv && mutableCodeBlocks[id].text !== value) {
          mutableCodeBlocks[id].text = value;
          tsEnv.updateFileFromText(fileName, value, span);
        }
        setSpan(newSpan);
      }}
      renderToken={(token, tokenProps) => {
        switch (token.type) {
          case 'tm':
            return (
              <span
                className={token.scopes.reduce((scopes, s) => `${scopes} ${s.split('.').join(' ')}`, '')}
                {...tokenProps}
              />
            );
          case TypeScriptTokenType.Identifier:
            return (
              <TypeScriptIdentifierToken
                staticQuickInfo={quickInfo}
                languageService={tsEnv && tsEnv.languageService}
                sourceFileName={fileName}
                position={token.sourcePosition}
                {...tokenProps}
              />
            );
          case TypeScriptTokenType.Diagnostic:
            return (
              <TypeScriptDiagnosticToken message={token.diagnosticMessage} {...tokenProps} />
            );
          default:
            return <span {...tokenProps} />;
        }
      }}
    />
  ), { timeout: 1000 });

  return deferredCodeBlock || <CheapCodeBlock>{text}</CheapCodeBlock>;
}

type VirtualTypeScriptEnvironment = import('../utils/typescript/services').VirtualTypeScriptEnvironment;
interface EditableContext {
  editable: boolean;
  mutableCodeBlocks: Record<string, CodeBlockContext>;
  sourceFiles?: Record<string, SourceFileContext>;
  tsEnv: VirtualTypeScriptEnvironment | undefined;
  onStartEditing?: () => void;
}

const EditableContext = React.createContext<EditableContext>({
  editable: false,
  tsEnv: undefined,
  mutableCodeBlocks: {},
});

function getFullText(sourceFileContext: SourceFileContext, codeBlocks: Record<string, CodeBlockContext>) {
  return sourceFileContext.preamble + sourceFileContext.fragments.map(f => codeBlocks[f.codeBlockId].text).join('\n');
}

function Post({ data, pageContext }: PostProps) {
  const post = data.markdownRemark;
  const mutableCodeBlocks = useRef(Object.keys(pageContext.codeBlocks).reduce((clone, codeBlockId) => ({
    ...clone,
    [codeBlockId]: { ...pageContext.codeBlocks[codeBlockId] },
  }), {} as Record<string, CodeBlockContext>));

  const [editable, setEditable] = useState(false);
  const [tsEnv, setTsEnv] = useState<VirtualTypeScriptEnvironment | undefined>(undefined);
  const context: EditableContext = useMemo(() => ({
    editable,
    tsEnv,
    mutableCodeBlocks: mutableCodeBlocks.current,
    onStartEditing: () => editable || setEditable(true),
    sourceFiles: pageContext.sourceFiles,
  }), [editable, tsEnv, mutableCodeBlocks.current]);
  Object.assign(window, { tsEnv, pageContext });

  useEffect(() => {
    if (editable) {
      (async () => {
        const [ts, { createVirtualTypeScriptEnvironment }, { lib }, { getExtraLibFiles }] = await Promise.all([
          await import('typescript'),
          await import('../utils/typescript/services'),
          await import('../utils/typescript/lib.webpack'),
          await import('../utils/typescript/utils'),
        ]);
        const sourceFiles = new Map(Object.keys(pageContext.sourceFiles).map(fileName => {
          const entries: [string, import('typescript').SourceFile] = [
            fileName,
            ts.createSourceFile(
              fileName,
              getFullText(pageContext.sourceFiles[fileName], pageContext.codeBlocks),
              ts.ScriptTarget.ES2015,
              false,
            ),
          ];
          return entries;
        }));
        setTsEnv(createVirtualTypeScriptEnvironment(
          sourceFiles,
          lib.core,
          await getExtraLibFiles(post.frontmatter.lib, lib),
        ));
      })();
    }

    return () => {
      if (tsEnv) {
        tsEnv.languageService.dispose();
      }
    };
  }, [editable]);

  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <EditableContext.Provider value={context}>
          <div>{renderAst(data.markdownRemark.htmlAst)}</div>
        </EditableContext.Provider>
      </div>
    </Layout>
  );
}

Post.displayName = 'Post';
export default Post;
