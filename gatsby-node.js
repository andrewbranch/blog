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
const { createSystem } = require('./src/utils/typescript/sys');
const { createVirtualTypeScriptEnvironment } = require('./src/utils/typescript/services');
const { getExtraLibFiles } = require('./src/utils/typescript/utils');
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
              globalPreamble,
              lib,
              template,
              preambles {
                file,
                text
              },
            }
          }
        }
      }
    }
  `);

  const grammar = await getTmRegistry(ssrFileProvider).loadGrammar('source.tsx');
  const tmTokenizer = createTmGrammarTokenizer({ grammar });
  if (result.errors) {
    throw new Error(result.errors.join('\n'));
  }

  return result.data.allMarkdownRemark.edges.map(async ({ node }) => {
    if (node.frontmatter.template === 'CodePost') {
      const sourceFileContext = {};
      const codeBlockContext = {};
      visit(
        node.htmlAst,
        node => node.tagName === 'code' && ['ts', 'tsx'].includes(node.properties.dataLang),
        code => {
          const codeBlockId = code.properties.id;
          const metaData = deserializeAttributes(code.properties);
          const fileName = metaData.name || `/${codeBlockId}.${metaData.lang}`;
          const text = code.children[0].value.trim();
          const codeBlock = { text, fileName, id: codeBlockId };
          codeBlockContext[codeBlockId] = codeBlock;
          const sourceFileFragment = { codeBlockId };
          const existingSourceFile = sourceFileContext[fileName];
          if (existingSourceFile) {
            const { codeBlockId: prevCodeBlockId } = existingSourceFile.fragments[existingSourceFile.fragments.length - 1];
            const prevCodeBlock = codeBlockContext[prevCodeBlockId];
            codeBlock.start = prevCodeBlock.end + 1;
            codeBlock.end = codeBlock.start + text.length;
            existingSourceFile.fragments.push(sourceFileFragment);
          } else {
            const filePreamble = node.frontmatter.preambles.find(p => p.file === fileName);
            const preamble = (node.frontmatter.globalPreamble || '') + (filePreamble ? filePreamble.text : '');
            codeBlock.start = preamble.length;
            codeBlock.end = codeBlock.start + text.length;
            sourceFileContext[fileName] = {
              fragments: [sourceFileFragment],
              preamble,
            };
          }
        }
      );

      const sourceFiles = new Map(Object.keys(sourceFileContext).map(fileName => {
        const context = sourceFileContext[fileName];
        const fullText = context.preamble + context.fragments.map(f => codeBlockContext[f.codeBlockId].text).join('\n');
        /** @type [string, string] */
        const entry = [fileName, fullText];
        return entry;
      }));

      const extraLibFiles = await getExtraLibFiles(node.frontmatter.lib, lib);
      const system = createSystem(new Map([
        ...Array.from(sourceFiles.entries()),
        ...Array.from(lib.core.entries()),
        ...Array.from(extraLibFiles.entries()),
      ]));
      const { languageService } = createVirtualTypeScriptEnvironment(system, Array.from(sourceFiles.keys()));
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
        component: path.resolve(`./src/templates/CodePost.tsx`),
        context: {
          // Data passed to context is available
          // in page queries as GraphQL variables.
          slug: node.fields.slug,
          codeBlocks: codeBlockContext,
          sourceFiles: sourceFileContext,
        },
      });
      languageService.dispose();
    } else {
      actions.createPage({
        path: node.fields.slug,
        component: path.resolve(`./src/templates/${node.frontmatter.template}.tsx`),
        context: {
          // Data passed to context is available
          // in page queries as GraphQL variables.
          slug: node.fields.slug,
        },
      });
    }
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
