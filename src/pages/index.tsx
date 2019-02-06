import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import { PostPreview } from '../components/PostPreview';
import SEO from '../components/SEO';

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

const IndexPage = React.memo<IndexPageProps>(({ data }) => {
  return (
    <Layout>
      <SEO title="All Posts" />
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <PostPreview
          key={node.id}
          slug={node.fields.slug}
          title={node.frontmatter.title}
          date={node.frontmatter.date}
          excerpt={node.excerpt}
        />
      ))}
    </Layout>
  );
});

export default IndexPage;
