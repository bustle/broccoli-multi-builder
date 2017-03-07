'use strict';
/* jshint node:true */

/*
 * using node modules from npm should "just work" in the es6 src with one
 * caveat:
 *   - the node module must export an object with a "default" value
 */

var Funnel = require('broccoli-funnel');
var ESTranspiler = require('broccoli-babel-transpiler');
var resolveSourceToRelative = require('../utils/resolve-source-to-relative');
var validateOptions = require('../utils/validate-options');
var validateVendoredModules = require('../utils/validate-node-modules');
var validateFileStructure = require('../utils/validate-file-structure');
var moduleUtils = require('../utils/vendored-module-utils');

function stripPrefix(string, prefix) {
  if (string.indexOf(prefix) === 0) {
    string = string.slice(prefix.length);
  }
  return string;
}

function treeBuilder(options) {
  validateOptions(options);

  validateVendoredModules(options.vendoredModules);
  validateFileStructure({
    validatePackageJSON: true
  }, options);

  var libDir = options.libDirName;
  var packageName = options.packageName;
  if (!packageName) { throw new Error('Missing options.packageName'); }
  var distNamespace = 'commonjs';
  var vendoredModuleNames = moduleUtils.getNames(options.vendoredModules);

  var tree = new Funnel(libDir, {
    destDir: '/' + distNamespace + '/' + packageName
  });

  tree = new ESTranspiler(tree, {
    moduleIds: true,
    modules: 'commonStrict',

    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    },
    resolveModuleSource: function (source, filename) {
      var sourceRoot = packageName;
      filename = stripPrefix(filename, distNamespace + '/');
      moduleUtils.validateImport(source, filename, vendoredModuleNames, packageName);
      if (moduleUtils.isVendoredImport(source, vendoredModuleNames)) {
        return source;
      } else {
        return resolveSourceToRelative(source, filename, sourceRoot);
      }
    }
  });

  return tree;
}

module.exports = {
  build: treeBuilder
};
