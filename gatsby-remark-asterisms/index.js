// @ts-check
const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'paragraph', node => {
    if (!node.children) return;
    if (node.children[0].type !== 'text' || node.children[0].value.trim() !== '⁂') return;
    node.data = { hProperties: { className: 'asterism' } };
  });

  return markdownAST;
};
