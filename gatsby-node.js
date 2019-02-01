/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// @ts-check
require('ts-node').register({ transpileOnly: true });
const ts = require('typescript');
const webpack = require('webpack');
const path = require('path');
const deburr = require('lodash.deburr');
const kebabCase = require('lodash.kebabcase');
const mergeWebpack = require('webpack-merge');
const { getTmRegistry } = require('./src/utils/textmate/getTmRegistry');
const { ssrFileProvider } = require('./src/utils/textmate/fileProvider.ssr');
const { createTmGrammarTokenizer } = require('./src/components/InteractiveCodeBlock/tokenizers/tmGrammar');
const { TypeScriptTokenType, TypeScriptDiagnosticTokenType } = require('./src/components/InteractiveCodeBlock/tokenizers/types');
const { createTypeScriptTokenizer } = require('./src/components/InteractiveCodeBlock/tokenizers/typescript');
const { composeTokenizers } = require('./src/components/InteractiveCodeBlock/tokenizers/composeTokenizers');
const { createVirtualTypeScriptEnvironment } = require('./src/utils/typescript/services');
const { lib } = require('./src/utils/typescript/lib.ssr');
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
  const grammar = await getTmRegistry(ssrFileProvider).loadGrammar('source.tsx');
  const tmTokenizer = createTmGrammarTokenizer({ grammar });
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const codeBlocks = {};
    visit(node.htmlAst, node => node.tagName === 'code', code => {
      const text = code.children[0].value.trimEnd();
      codeBlocks[code.properties.id] = { text };
    });

    const sourceFiles = new Map(Object.keys(codeBlocks).map(codeBlockId => {
      const fileName = `/${codeBlockId}.tsx`;
      /** @type [string, ts.SourceFile] */
      const entry = [fileName, ts.createSourceFile(fileName, codeBlocks[codeBlockId].text, ts.ScriptTarget.ES2015)];
      return entry;
    }));

    const { languageService } = createVirtualTypeScriptEnvironment(sourceFiles, lib.ts);
    Object.keys(codeBlocks).forEach(codeBlockId => {
      const codeBlock = codeBlocks[codeBlockId];
      const fileName = `/${codeBlockId}.tsx`;
      const typeScriptTokenizer = createTypeScriptTokenizer({ fileName, languageService });
      const tokenizer = composeTokenizers(tmTokenizer, typeScriptTokenizer);
      codeBlock.tokens = tokenizer.tokenizeDocument(codeBlock.text);
      codeBlock.quickInfo = {};
      codeBlock.tokens.forEach(line => {
        line.tokens.forEach(token => {
          switch (token.type) {
            case TypeScriptTokenType.Identifier:
              codeBlock.quickInfo[token.sourcePosition] = languageService.getQuickInfoAtPosition(
                fileName,
                token.sourcePosition
              );
          }
        });
      });
    });

    actions.createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/Post.tsx`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.fields.slug,
        codeBlocks,
      },
    });
    languageService.dispose();
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
