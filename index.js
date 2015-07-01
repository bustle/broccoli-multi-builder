var amdTreeBuilder = require('./lib/broccoli/amd-tree-builder');
var cjsTreeBuilder = require('./lib/broccoli/cjs-tree-builder');

function build(treeType, options) {
  switch (treeType) {
    case 'amd':
    case 'global':
      return amdTreeBuilder.build(options);
    case 'commonjs':
      return cjsTreeBuilder.build(options);
    default:
      throw new Error('Tree type "' + treeType + '" is unknown');
  }
}

module.exports = {
  build: build
};
