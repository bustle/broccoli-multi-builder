var amdTreeBuilder = require('./lib/broccoli/amd-tree-builder');
var cjsTreeBuilder = require('./lib/broccoli/cjs-tree-builder');

module.exports = {
  buildAMD: amdTreeBuilder,
  buildCJS: cjsTreeBuilder
};
