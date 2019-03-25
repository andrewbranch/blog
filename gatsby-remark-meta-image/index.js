// @ts-check
const path = require('path');
const { resize } = require(`gatsby-plugin-sharp`);

module.exports = async ({ files, markdownNode, getNode, reporter, actions }) => {
  if (markdownNode.frontmatter.metaImage) {
    const parentNode = getNode(markdownNode.parent);
    let imagePath;
    if (parentNode && parentNode.dir) {
      imagePath = path.join(parentNode.dir, markdownNode.frontmatter.metaImage);
    } else {
      return;
    }

    const imageNode = files.find(file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath;
      }
    });

    if (!imageNode || !imageNode.absolutePath) {
      return;
    }

    const resizeResult = await resize({
      file: imageNode,
      args: { width: 1600 },
      reporter,
    });

    actions.createNodeField({
      node: markdownNode,
      name: 'metaImage',
      value: resizeResult.src,
    });
  }
};
