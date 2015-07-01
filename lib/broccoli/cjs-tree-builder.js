'use strict';
/* jshint node:true */

/*
 * using node modules from npm should "just work" in the es6 src with one
 * caveat:
 *   - the node module must export an object with a "default" value
 */

var funnel = require('broccoli-funnel');
var esTranspiler = require('broccoli-babel-transpiler');
var resolveSourceToRelative = require('../utils/resolve-source-to-relative');
var validateOptions = require('../utils/validate-options');
var validateVendoredModules = require('../utils/validate-node-modules');
var validateFileStructure = require('../utils/validate-file-structure');

function treeBuilder(options) {
  validateOptions(options);

  validateVendoredModules(options.vendoredModules);
  validateFileStructure({
    validatePackageJSON: true
  }, options);

  var libDir = options.libDirName;
  var packageName = options.packageName;
  if (!packageName) {
    throw new Error('Missing options.packageName');
  }

  var tree = funnel(libDir, {
    destDir: '/' + 'commonjs' + '/' + packageName
  });

  tree = esTranspiler(tree, {
    moduleIds: true,
    modules: 'commonStrict',

    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    },
    resolveModuleSource: function (source, filename) {
      return resolveSourceToRelative(source, filename, packageName);
    }
  });

  return tree;
}

module.exports = {
  build: treeBuilder
};
