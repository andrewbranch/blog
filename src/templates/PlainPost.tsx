import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import RehypeReact from 'rehype-react';
import SEO from '../components/SEO';
import { PostFooter } from '../components/PostFooter';

const renderAst = new RehypeReact({
  createElement: React.createElement,
}).Compiler;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst,
      frontmatter {
        title,
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`;


export interface PlainPostProps {
  data: {
    markdownRemark: {
      htmlAst: any;
      frontmatter: {
        title: string;
        date: string;
      };
    };
  };
}

export default function PlainPost({ data }: PlainPostProps) {
  const post = data.markdownRemark;
  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div>{renderAst(data.markdownRemark.htmlAst)}</div>
      </div>
      <PostFooter date={post.frontmatter.date} />
    </Layout>
  );
}
