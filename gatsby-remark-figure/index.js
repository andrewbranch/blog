// @ts-check
const visit = require('unist-util-visit');

const captionPattern = /^[\s]*\! /;

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'paragraph', node => {
    if (!node.children) return;
    if (node.children.length < 2) return;

    if (node.children[0].type !== 'text' || node.children[0].value !== '! ') return;
    if (node.children[1].type !== 'image') return;
    if (node.children[2].type !== 'text' || !captionPattern.test(node.children[2].value)) return;

    const image = node.children[1];
    const leadingCaptionText = node.children[2];
    const rest = node.children.slice(2) || [];
    node.data = { hName: 'figure' };
    node.type = 'figure';

    const match = leadingCaptionText.value.match(captionPattern);
    leadingCaptionText.value = leadingCaptionText.value.slice(match[0].length);
    const children = leadingCaptionText.children || [];
    delete leadingCaptionText.children;

    const figcaption = {
      children: [leadingCaptionText, ...children, ...rest],
      data: { hName: 'figcaption' },
      type: 'figcaption'
    }

    node.children = [image, figcaption];
  });

  return markdownAST;
};
