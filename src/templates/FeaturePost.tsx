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
import { SmallCaps } from '../components/IntroCaps';

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: { 'small-caps': SmallCaps },
}).Compiler;

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      frontmatter {
        title
        subtitle
        date(formatString: "MMMM DD, YYYY")
        metaImage {
          childImageSharp {
            fluid(maxWidth: 1600) {
              src
            }
          }
        }
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
        subtitle?: string;
        date: string;
        metaImage: {
          childImageSharp: {
            fluid: {
              src: string;
            };
          };
        };
      };
    };
  };
}

const titleStyle = css([{ fontWeight: 400, fontSize: '3rem', textAlign: 'center' }]);
const subtitleStyle = css([type.serif, textColor.secondary, flex.verticallyCenter, {
  textAlign: 'center',
  fontStyle: 'italic',
  fontSize: '1.2rem',
  '-webkit-font-smoothing': 'antialiased',
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
      <SEO
        title={formatTitle(post.frontmatter.title, post.frontmatter.subtitle)}
        image={post.frontmatter.metaImage.childImageSharp.fluid.src}
      />
      <div>
        <h1 css={titleStyle}>{post.frontmatter.title}</h1>
        {post.frontmatter.subtitle && <h2 css={subtitleStyle}>
          {post.frontmatter.subtitle}
        </h2>}
        <div className="post-body">{renderAst(data.markdownRemark.htmlAst)}</div>
      </div>
      <PostFooter date={post.frontmatter.date} />
    </Layout>
  );
}
