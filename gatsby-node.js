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
const { TypeScriptTokenType } = require('./src/components/InteractiveCodeBlock/tokenizers/types');
const { createTypeScriptTokenizer } = require('./src/components/InteractiveCodeBlock/tokenizers/typescript');
const { composeTokenizers } = require('./src/components/InteractiveCodeBlock/tokenizers/composeTokenizers');
const { createVirtualTypeScriptEnvironment } = require('./src/utils/typescript/services');
const { lib } = require('./src/utils/typescript/lib.ssr');
const { deserializeAttributes } = require('./gatsby-remark-annotate-code-blocks');
const visit = require('unist-util-visit');

/**
 * Returns a new array from a source array without null and undefined elements
 * @param {any[]} arr 
 */
function compact(arr) {
  return arr.filter(elem => elem != null);
}

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
            },
            frontmatter {
              globalPreamble
            }
          }
        }
      }
    }
  `);
  const grammar = await getTmRegistry(ssrFileProvider).loadGrammar('source.tsx');
  const tmTokenizer = createTmGrammarTokenizer({ grammar });
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const sourceFileContext = {};
    const codeBlockContext = {};
    visit(
      node.htmlAst,
      node => node.tagName === 'code' && node.properties.className && node.properties.className.includes('language-ts'),
      code => {
        const codeBlockId = code.properties.id;
        const metaData = deserializeAttributes(code.properties);
        const fileName = metaData.name || `/${codeBlockId}.tsx`;
        const text = code.children[0].value.trim();
        const codeBlock = { text, fileName };
        codeBlockContext[codeBlockId] = codeBlock;
        const sourceFileFragment = { codeBlockId };
        const existingSourceFile = sourceFileContext[fileName];
        if (existingSourceFile) {
          const { codeBlockId: prevCodeBlockId } = existingSourceFile.fragments[existingSourceFile.fragments.length - 1];
          const prevCodeBlock = codeBlockContext[prevCodeBlockId];
          codeBlock.start = prevCodeBlock.text.length + 1;
          codeBlock.end = prevCodeBlock.start + text.length;
          existingSourceFile.fragments.push(sourceFileFragment);
          existingSourceFile.preamble = compact([existingSourceFile.preamble, metaData.preamble]).join('\n');
        } else {
          codeBlock.start = (node.frontmatter.globalPreamble || '').length;
          codeBlock.end = codeBlock.start + text.length;
          sourceFileContext[fileName] = {
            fragments: [sourceFileFragment],
            preamble: node.frontmatter.globalPreamble || '',
          };
        }
      }
    );

    const sourceFiles = new Map(Object.keys(sourceFileContext).map(fileName => {
      const context = sourceFileContext[fileName];
      const fullText = context.preamble + context.fragments.map(f => codeBlockContext[f.codeBlockId].text).join('\n');
      /** @type [string, ts.SourceFile] */
      const entry = [fileName, ts.createSourceFile(fileName, fullText, ts.ScriptTarget.ES2015)];
      return entry;
    }));

    const { languageService } = createVirtualTypeScriptEnvironment(sourceFiles, lib.ts);
    Object.keys(codeBlockContext).forEach(codeBlockId => {
      const codeBlock = codeBlockContext[codeBlockId];
      const { fileName } = codeBlock;
      const typeScriptTokenizer = createTypeScriptTokenizer({
        fileName,
        languageService,
        visibleSpan: { start: codeBlock.start, length: codeBlock.end - codeBlock.start },
      });
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
        codeBlocks: codeBlockContext,
        sourceFiles: sourceFileContext,
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
