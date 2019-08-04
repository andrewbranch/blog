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
const { getExtraLibFiles, isTypeScriptFileName: isTypeScriptFileName } = require('./src/utils/typescript/utils');
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

function toScopeName(lang) {
  switch (lang) {
    case 'ts':
    case 'tsx':
      return 'source.tsx'
    case 'md':
      return 'text.html.markdown';
  }
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
              compilerOptions,
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

  if (result.errors) {
    throw new Error(result.errors.join('\n'));
  }

  try {
    return Promise.all(result.data.allMarkdownRemark.edges.map(async ({ node }) => {
      if (node.frontmatter.template === 'CodePost') {
        const sourceFileContext = {};
        const codeBlockContext = {};
        visit(
          node.htmlAst,
          node => node.tagName === 'code' && ['ts', 'tsx', 'md'].includes(node.properties.dataLang),
          code => {
            const codeBlockId = code.properties.id;
            const metaData = deserializeAttributes(code.properties);
            const fileName = metaData.name || `/${codeBlockId}.${metaData.lang}`;
            const text = code.children[0].value.trim();
            const codeBlock = { text, fileName, id: codeBlockId, lang: code.properties.dataLang };
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
                lang: codeBlock.lang,
              };
            }
          }
        );

        const sourceFiles = new Map(Object.keys(sourceFileContext)
          .filter(fileName => isTypeScriptFileName(fileName))
          .map(fileName => {
            const context = sourceFileContext[fileName];
            const fullText = context.preamble + context.fragments.map(f => codeBlockContext[f.codeBlockId].text).join('\n');
            /** @type [string, string] */
            const entry = [fileName, fullText];
            return entry;
          }));

        const extraLibFiles = await getExtraLibFiles(node.frontmatter.lib || [], lib);
        const system = createSystem(new Map([
          ...Array.from(sourceFiles.entries()),
          ...Array.from(lib.core.entries()),
          ...Array.from(extraLibFiles.entries()),
        ]));
        const { languageService } = createVirtualTypeScriptEnvironment(
          system,
          Array.from(sourceFiles.keys()),
          node.frontmatter.compilerOptions,
        );
        await Promise.all(Object.keys(codeBlockContext).map(async codeBlockId => {
          const codeBlock = codeBlockContext[codeBlockId];
          const { fileName } = codeBlock;
          const typeScriptTokenizer = isTypeScriptFileName(fileName) ? createTypeScriptTokenizer({
            fileName,
            languageService,
            visibleSpan: { start: codeBlock.start, length: codeBlock.end - codeBlock.start },
          }) : undefined;
          const grammar = await getTmRegistry(ssrFileProvider).loadGrammar(toScopeName(codeBlock.lang));
          const tmTokenizer = createTmGrammarTokenizer({ grammar });
          const tokenizer = composeTokenizers(...compact([tmTokenizer, typeScriptTokenizer]));
          codeBlock.tokens = tokenizer.tokenizeDocument(codeBlock.text);
          if (isTypeScriptFileName(fileName)) {
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
          }
        }));

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
    }));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
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

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      compilerOptions: JSON
    }
  `
  createTypes(typeDefs)
}