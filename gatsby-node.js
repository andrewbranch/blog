/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// @ts-check
require('ts-node').register({ transpileOnly: true });
const webpack = require('webpack');
const path = require('path');
const deburr = require('lodash.deburr');
const kebabCase = require('lodash.kebabcase');
const mergeWebpack = require('webpack-merge');
const { tmRegistry } = require('./src/utils/tmRegistry');
const { createTmGrammarTokenizer } = require('./src/components/InteractiveCodeBlock/tokenizers/tmGrammar');
const visit = require('unist-util-visit');

exports.onCreateNode = async ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'MarkdownRemark' && !(node.internal.fieldOwners && node.internal.fieldOwners.slug)) {
    createNodeField({
      node,
      name: 'slug',
      value: `/${node.frontmatter.slug || kebabCase(deburr(node.frontmatter.title))}/`,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            htmlAst,
            fields {
              slug
            }
          }
        }
      }
    }
  `);
  const grammar = await tmRegistry.loadGrammar('source.tsx');
  const tokenizer = createTmGrammarTokenizer({ grammar });
  const tokens = {};
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    visit(node.htmlAst, node => node.tagName === 'code', code => {
      const text = code.children[0].value.trimEnd();
      tokens[code.properties.id] = tokenizer.tokenizeDocument(text);
    });
    actions.createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/Post.tsx`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.fields.slug,
        tokens
      },
    });
  });
};

exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  /** @type {webpack.Configuration} */
  const oldConfig = getConfig();
  /** @type {webpack.Configuration} */
  const config = mergeWebpack.smart(oldConfig, {
    module: {
      rules: [
        {
          test: /\.wasm$/,
          loader: "file-loader",
          type: "javascript/auto",
        }
      ]
    },
    output: {
      globalObject: 'this'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.TEST_PSEUDOMAP': 'this["_____"]'
      })
    ],
    externals: ['fs']
  });

  actions.replaceWebpackConfig(config);
};
