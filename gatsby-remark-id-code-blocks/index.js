const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  let id = 0;
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