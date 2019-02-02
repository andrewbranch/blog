const visit = require('unist-util-visit');
const yaml = require('js-yaml');
const metaYamlPattern = /<!--@\s*([\s\S]+)\s*-->/;

module.exports = ({ markdownAST }) => {
  let id = 0;
  visit(markdownAST, 'code', node => {
    const index = markdownAST.children.indexOf(node);
    if (index > -1) {
      let metaAttrs;
      const commentNode = markdownAST.children[index - 1];
      if (commentNode && commentNode.type === 'html' && metaYamlPattern.test(commentNode.value)) {
        const yamlString = commentNode.value.match(metaYamlPattern)[1];
        const metaData = yaml.safeLoad(yamlString);
        metaAttrs = serializeMetaData(metaData);
      }
      node.data = {
        ...node.data,
        hProperties: {
          ...metaAttrs,
          ...(node.data && node.data.hProperties),
          id: `code-${id++}`,
          'data-lang': node.lang,
        }
      };
      node.value = node.value.trim();
    }
  });
};

/**
 * @param {Record<string, string>} data The raw data to serialize into HTML data attributes
 * @returns {Record<string, string>}
 */
function serializeMetaData(data) {
  return Object.keys(data).reduce((hash, key) => ({ ...hash, [`data-${key}`]: data[key] }), {});
}

/**
 * @param {Record<string, string>} attrs The HTML data attributes to deserialize
 * @returns {Record<string, string>}
 */
function deserializeAttributes(attrs) {
  return Object.keys(attrs).reduce((hash, key) => {
    if (key.startsWith('data')) {
      const suffix = key.slice('data'.length);
      const transformedKey = suffix[0].toLowerCase() + suffix.slice(1);
      return { ...hash, [transformedKey]: attrs[key] };
    }
    return hash;
  }, {});
}

module.exports.serializeMetaData = serializeMetaData;
module.exports.deserializeAttributes = deserializeAttributes;
