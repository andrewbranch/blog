import React from 'react';
import ts from 'typescript';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { PostPreview } from '../components/PostPreview';
import { InteractiveCodeBlock } from '../components/InteractiveCodeBlock/InteractiveCodeBlock';
import { createTypeScriptTokenizer, isIdentifierClassification, } from '../components/InteractiveCodeBlock/tokenizers';
import { prismVSCode, typeScriptVSCode } from '../components/InteractiveCodeBlock/themes';
import { createVirtualTypeScriptEnvironment, libraryFiles } from '../utils/typescript';
import { TypeScriptIdentifierToken } from '../components/InteractiveCodeBlock/TypeScriptIdentifierToken';

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

const sourceFile = ts.createSourceFile('/example.ts', preamble + code, ts.ScriptTarget.ES2015);
const { languageService, updateFileFromText } = createVirtualTypeScriptEnvironment([sourceFile], [libraryFiles.react]);
const tokenizer = createTypeScriptTokenizer({ languageService, preambleCode: preamble, fileName: '/example.ts' });

const IndexPage = React.memo<IndexPageProps>(({ data }) => (
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
    <InteractiveCodeBlock
      initialValue={code}
      {...tokenizer}
      tokenStyles={typeScriptVSCode.tokens}
      onChange={value => updateFileFromText('/example.ts', preamble + value)}
      css={prismVSCode.block}
      renderToken={(token, props) => {
        if (isIdentifierClassification(token.type)) {
          return (
            <TypeScriptIdentifierToken
              languageService={languageService}
              position={token.start + preamble.length}
              sourceFileName="/example.ts"
              data-syntax-kind={token.type}
              {...props}
            />
          );
        }
        return <span data-syntax-kind={token.type} {...props} />;
      }}
    />
  </Layout>
));

export default IndexPage;
