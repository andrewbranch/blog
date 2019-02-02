import React, { HTMLAttributes, useEffect } from 'react';
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

export interface CodeBlockContext {
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
        title
      }
    }
  }
`;

interface ProgressiveCodeBlockProps {
  codeBlock: CodeBlockContext;
  onStartEditing: () => void;
}

function ProgressiveCodeBlock({
  codeBlock,
  onStartEditing,
}: ProgressiveCodeBlockProps) {
  const { start, end, tokens: initialTokens, quickInfo, text, fileName } = codeBlock;
  const { editable, tsEnv } = React.useContext(EditableContext);
  const visibleSpan = { start, length: end - start };
  const tokenizer = useProgressiveTokenizer({
    initialTokens,
    editable,
    languageService: tsEnv && tsEnv.languageService,
    fileName: codeBlock.fileName,
    visibleSpan,
  });
  const deferredCodeBlock = useDeferredRender(() => (
    <InteractiveCodeBlock
      className="tm-theme"
      initialValue={text}
      tokenizer={tokenizer}
      readOnly={!editable}
      onClick={() => editable || onStartEditing()}
      onChange={value => tsEnv && tsEnv.updateFileFromText(fileName, value, visibleSpan)}
      renderToken={(token, tokenProps) => (
        <EditableContext.Consumer>
          {({ tsEnv: innerTsEnv }) => {
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
                    languageService={innerTsEnv && innerTsEnv.languageService}
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
        </EditableContext.Consumer>
      )}
    />
  ), { timeout: 1000 });

  return deferredCodeBlock || <CheapCodeBlock>{text}</CheapCodeBlock>;
}

type VirtualTypeScriptEnvironment = import('../utils/typescript/services').VirtualTypeScriptEnvironment;
interface EditableContext {
  editable: boolean;
  tsEnv: VirtualTypeScriptEnvironment | undefined;
}

const EditableContext = React.createContext<EditableContext>({ editable: false, tsEnv: undefined });

function createRenderer(tokens: { [key: string]: CodeBlockContext }, setEditable: (editable: boolean) => void) {
  const renderAst = new RehypeReact({
    createElement: (type, props, children) => {
      if (type === 'pre') {
        const codeChild: React.ReactElement<HTMLAttributes<HTMLElement>> = (children as any)[0];
        const id = codeChild.props.id!;
        const codeBlock = tokens[id];
        if (codeBlock) {
          return (
            <ProgressiveCodeBlock
              key={id}
              codeBlock={codeBlock}
              onStartEditing={() => setEditable(true)}
            />
          );
        }
      }
      return React.createElement(type, props, children);
    },
  }).Compiler;

  return renderAst;
}

function getFullText(sourceFileContext: SourceFileContext, codeBlocks: Record<string, CodeBlockContext>) {
  return sourceFileContext.preamble + sourceFileContext.fragments.map(f => codeBlocks[f.codeBlockId].text).join('\n');
}

function Post({ data, pageContext }: PostProps) {
  const post = data.markdownRemark;
  const [editable, setEditable] = React.useState(false);
  const [tsEnv, setTsEnv] = React.useState<VirtualTypeScriptEnvironment | undefined>(undefined);
  const renderAst = React.useMemo(() => createRenderer(pageContext.codeBlocks, setEditable), [pageContext.codeBlocks]);
  Object.assign(window, { tsEnv, pageContext });

  useEffect(() => {
    if (editable) {
      (async () => {
        const [ts, { createVirtualTypeScriptEnvironment }, { lib }] = await Promise.all([
          await import('typescript'),
          await import('../utils/typescript/services'),
          await import('../utils/typescript/lib.webpack'),
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
        setTsEnv(createVirtualTypeScriptEnvironment(sourceFiles, lib.ts));
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
        <EditableContext.Provider value={{ editable, tsEnv }}>
          <div>{renderAst(data.markdownRemark.htmlAst)}</div>
        </EditableContext.Provider>
      </div>
    </Layout>
  );
}

Post.displayName = 'Post';
export default Post;
