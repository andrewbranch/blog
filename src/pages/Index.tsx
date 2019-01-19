import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { PostPreview } from '../components/PostPreview';

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
          excerpt(format: HTML)
        }
      }
    }
  }
`;

const IndexPage = React.memo<IndexPageProps>(({ data }) => (
  <Layout>
    {data.allMarkdownRemark.edges.map(({ node }) => (
      <PostPreview
        key={node.id}
        title={node.frontmatter.title}
        date={node.frontmatter.date}
        excerpt={node.excerpt}
      />
    ))}
  </Layout>
));

export default IndexPage;
