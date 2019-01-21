import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { PostPreview } from '../components/PostPreview';
import { InteractiveCodeBlock } from '../components/InteractiveCodeBlock/InteractiveCodeBlock';
import ts from 'typescript';
import { createPrismTokenizer, PrismGrammar, composeTokenizers, createTypeScriptTokenizer, TypeScriptTokenType } from '../components/InteractiveCodeBlock/tokenizers';
import { prismVSCode } from '../components/InteractiveCodeBlock/themes';

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

const tokenizer = composeTokenizers(
  createPrismTokenizer({ grammar: PrismGrammar.TypeScript }),
  createTypeScriptTokenizer({ sourceFile: ts.createSourceFile('/example.ts', code, ts.ScriptTarget.ES2015) }),
);

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
      tokenStyles={{ ...prismVSCode.tokens, [TypeScriptTokenType.Identifier]: { cursor: 'pointer' } }}
      css={prismVSCode.block}
    />
  </Layout>
));

export default IndexPage;
