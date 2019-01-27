import React from 'react';
import ts from 'typescript';
import { useAsync } from 'react-async-hook';
import { loadWASM, OnigScanner, OnigString } from 'onigasm';
import { Registry, parseRawGrammar, IOnigLib } from 'vscode-textmate';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { PostPreview } from '../components/PostPreview';
import { InteractiveCodeBlock } from '../components/InteractiveCodeBlock/InteractiveCodeBlock';
import { createTmGrammarTokenizer } from '../components/InteractiveCodeBlock/tokenizers';
import { typeScriptVSCode, tmVSCode, prismVSCode } from '../components/InteractiveCodeBlock/themes';
import { createVirtualTypeScriptEnvironment, libraryFiles } from '../utils/typescript';
import { createPrismTokenizer, PrismGrammar } from '../components/InteractiveCodeBlock/tokenizers/prism';
// import { TypeScriptIdentifierToken } from '../components/InteractiveCodeBlock/TypeScriptIdentifierToken';

export interface IndexPageProps {
  data: {
    allMarkdownRemark: {
      totalCount: number;
      edges: {
        node: {
          id: string;
          frontmatter: {
            title: string;
            date: string;
          };
          fields: {
            slug: string;
          };
          excerpt: string;
        };
      }[];
    };
  };
}

export const query = graphql`
  query {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt(format: HTML)
        }
      }
    }
  }
`;

const preamble = 'import * as React from "react";\n';
const code = `interface CommonSelectProps {
  placeholder?: string;
  options: string[];
}

interface SingleSelectProps extends CommonSelectProps {
  multiple?: false;
  value: string;
  onChange: (newValue: string[]) => void;
}

interface MultipleSelectProps extends CommonSelectProps {
  multiple: true;
  value: string[];
  onChange: (newValue: string[]) => void;
}

type SelectProps = SingleSelectProps | MultipleSelectProps;

class Select extends React.Component<SelectProps> {
  // ...
}`;

const tmRegistry = new Registry({
  loadGrammar: async scopeName => {
    switch (scopeName) {
      case 'source.tsx':
        // tslint:disable-next-line:no-implicit-dependencies
        const content = await import('!raw-loader!../utils/TypeScriptReact.tmLanguage');
        return parseRawGrammar(content.default, '');
      default:
        return null;
    }
  },
  getOnigLib: async () => {
    // tslint:disable-next-line:no-implicit-dependencies
    const wasmBin = await import('onigasm/lib/onigasm.wasm');
    return loadWASM(wasmBin.default).then<IOnigLib>(() => ({
      createOnigScanner: patterns => new OnigScanner(patterns),
      createOnigString: s => new OnigString(s),
    }));
  },
});

const sourceFile = ts.createSourceFile('/example.ts', preamble + code, ts.ScriptTarget.ES2015);
const {
  updateFileFromText,
} = createVirtualTypeScriptEnvironment([sourceFile], [libraryFiles.react]);
// const tokenizer = createPrismTokenizer({ grammar: PrismGrammar.TypeScript });

const IndexPage = React.memo<IndexPageProps>(({ data }) => {
  const grammar = useAsync(tmRegistry.loadGrammar.bind(tmRegistry), 'source.tsx');
  const tokenizer = grammar.result ? createTmGrammarTokenizer({ grammar: grammar.result }) : undefined;
  return (
    <Layout>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <PostPreview
          key={node.id}
          slug={node.fields.slug}
          title={node.frontmatter.title}
          date={node.frontmatter.date}
          excerpt={node.excerpt}
        />
      ))}
      <hr />
      {tokenizer ? (
        <InteractiveCodeBlock
          className="tm-theme"
          initialValue={code}
          tokenizer={tokenizer}
          tokenStyles={tmVSCode.tokens}
          onChange={value => updateFileFromText('/example.ts', preamble + value)}
          css={typeScriptVSCode.block}
          renderToken={(token, props) => {
            // if (isIdentifierClassification(token.type)) {
            //   return (
            //     <TypeScriptIdentifierToken
            //       languageService={languageService}
            //       position={token.sourcePosition}
            //       sourceFileName="/example.ts"
            //       {...props}
            //     />
            //   );
            // }
            return (
              <span
                // css={prismVSCode.tokens[token.scopes[0]]}
                className={token.scopes.reduce((scopes, s) => `${scopes} ${s.split('.').join(' ')}`, '')}
                data-token-hash={token.getHash()}
                {...props}
              />
            );
          }}
        />
      ) : null}
    </Layout>
  );
});

export default IndexPage;
