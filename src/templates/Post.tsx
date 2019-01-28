import React, { HTMLAttributes } from 'react';
import Layout from '../components/layout';
import { graphql } from 'gatsby';
// @ts-ignore
import RehypeReact from 'rehype-react';
import { InteractiveCodeBlock } from '../components/InteractiveCodeBlock/InteractiveCodeBlock';
import { Token, CacheableLineTokens } from '../components/InteractiveCodeBlock/tokenizers';

export interface PostProps {
  data: {
    markdownRemark: {
      html: string;
      htmlAst: any;
      frontmatter: {
        title: string;
      };
    };
  };
  pageContext: {
    tokens: { [key: string]: CacheableLineTokens<Token<string, string>>[] };
  };
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html,
      htmlAst,
      frontmatter {
        title
      }
    }
  }
`;

function createRenderer(tokens: { [key: string]: CacheableLineTokens<Token<string, string>>[] }) {
  const renderAst = new RehypeReact({
    createElement: (type: string, props: React.HTMLAttributes<HTMLElement>, children: React.ReactChildren) => {
      if (type === 'pre') {
        const codeChild: React.ReactElement<HTMLAttributes<HTMLElement>> = (children as any)[0];
        const tokensForLine = tokens[codeChild.props.id!];
        return (
          <InteractiveCodeBlock
            data-id={props.id}
            className="tm-theme"
            initialValue={(codeChild.props.children as any)[0]}
            tokenizer={{ tokenizeDocument: () =>  tokensForLine}}
            renderToken={(token, tokenProps) => {
              return (
                <span
                  className={token.scopes.reduce((scopes, s) => `${scopes} ${s.split('.').join(' ')}`, '')}
                  data-token-hash={token.hash}
                  {...tokenProps}
                />
              );
            }}
          />
        );
      } else {
        return React.createElement(type, props, children);
      }
    },
  }).Compiler;

  return renderAst;
}

const Post = ({ data, pageContext }: PostProps) => {
  const post = data.markdownRemark;
  const renderAst = React.useMemo(() => createRenderer(pageContext.tokens), [pageContext.tokens]);
  (window as any).pageContext = pageContext;
  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div>{renderAst(data.markdownRemark.htmlAst)}</div>
      </div>
    </Layout>
  );
};

Post.displayName = 'Post';
export default Post;
