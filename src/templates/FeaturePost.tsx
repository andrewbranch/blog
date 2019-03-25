import React from 'react';
import { graphql } from 'gatsby';
import { css } from '@emotion/core';
import RehypeReact from 'rehype-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { PostFooter } from '../components/PostFooter';
import { useScrollDepthTracking } from '../hooks/useScrollDepthTracking';
import { type, textColor, variables, flex, padding, Side } from '../styles/utils';
import { formatTitle } from '../utils/formatTitle';

const renderAst = new RehypeReact({
  createElement: React.createElement,
}).Compiler;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst,
      frontmatter {
        title,
        subtitle,
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`;

export interface FeaturePostProps {
  data: {
    markdownRemark: {
      htmlAst: any;
      frontmatter: {
        title: string;
        subtitle: string;
        date: string;
      };
    };
  };
}

const subtitleStyle = css([type.script, textColor.secondary, flex.verticallyCenter, {
  textAlign: 'center',
  justifyContent: 'center',
  '::before, ::after': {
    content: '"~"',
    color: variables.colors.text.disabled,
  },
  '::before': padding(0.4, Side.Right),
  '::after': padding(0.4, Side.Left),
}]);

export default function FeaturePost({ data }: FeaturePostProps) {
  const post = data.markdownRemark;
  useScrollDepthTracking();
  return (
    <Layout>
      <SEO title={formatTitle(post.frontmatter.title, post.frontmatter.subtitle)} />
      <div>
        <h1 css={{ fontWeight: 'normal', fontSize: '3rem', textAlign: 'center' }}>{post.frontmatter.title}</h1>
        <h2 css={subtitleStyle}>
          {post.frontmatter.subtitle}
        </h2>
        <div>{renderAst(data.markdownRemark.htmlAst)}</div>
      </div>
      <PostFooter date={post.frontmatter.date} />
    </Layout>
  );
}
