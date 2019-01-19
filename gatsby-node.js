/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// @ts-check
const path = require('path');
const deburr = require('lodash.deburr');
const kebabCase = require('lodash.kebabcase');

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'MarkdownRemark') {
    
    createNodeField({
      node,
      name: 'slug',
      value: `/${node.frontmatter.slug || kebabCase(deburr(node.frontmatter.title))}/`,
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `).then(result => {
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      actions.createPage({
        path: node.fields.slug,
        component: path.resolve(`./src/templates/Post.tsx`),
        context: {
          // Data passed to context is available
          // in page queries as GraphQL variables.
          slug: node.fields.slug,
        },
      });
    });
  });
};

