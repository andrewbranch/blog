import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import RehypeReact from 'rehype-react';
import SEO from '../components/SEO';
import { PostFooter } from '../components/PostFooter';
import { useScrollDepthTracking } from '../hooks/useScrollDepthTracking';
import { type, textColor } from '../styles/utils';
import { SmallCaps } from '../components/SmallCaps';

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: { 'small-caps': SmallCaps },
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
  useScrollDepthTracking();
  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <div>
        <h1>{post.frontmatter.title}</h1>
        <p css={[type.grotesk, textColor.muted, { fontWeight: 500 }]}>{post.frontmatter.date}</p>
        <div className="post-body">{renderAst(data.markdownRemark.htmlAst)}</div>
      </div>
      <PostFooter date={post.frontmatter.date} />
    </Layout>
  );
}
