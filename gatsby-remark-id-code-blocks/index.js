const visit = require('unist-util-visit');
let id = 0;

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'code', node => {
    node.data = {
      ...node.data,
      hProperties: {
        ...(node.data && node.data.hProperties),
        id: `code-${id++}`
      }
    };
    node.value = node.value.trim();
  });
};