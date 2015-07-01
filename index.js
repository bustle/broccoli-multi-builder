var amdTreeBuilder = require('./lib/broccoli/amd-tree-builder');
var cjsTreeBuilder = require('./lib/broccoli/cjs-tree-builder');
var defaults = require('lodash/object/defaults');

var defaultBaseOptions = {
  libDirName: 'lib',
  vendoredModules: [],
  outputFileName: null,
  packageName: null
};

var defaultAMDOptions = defaults({
  loader: false
}, defaultBaseOptions);

var defaultGlobalOptions = defaults({
  isGlobal: true,
  loader: true,
  registerGlobalExport: 'registerGlobal',
}, defaultBaseOptions);

var defaultCommonJSOptions = defaults({}, defaultBaseOptions);

function build(treeType, options) {
  options = options || {};

  switch (treeType) {
    case 'amd':
      options = defaults({}, options, defaultAMDOptions);
      return amdTreeBuilder.build(options);
    case 'global':
      options = defaults({}, options, defaultGlobalOptions);
      return amdTreeBuilder.build(options);
    case 'commonjs':
      options = defaults({}, options, defaultCommonJSOptions);
      return cjsTreeBuilder.build(options);
    default:
      throw new Error('Tree type "' + treeType + '" is unknown');
  }
}

module.exports = {
  build: build
};
