/* jshint node:true */

/*
 * using node modules from npm should "just work" in the es6 src with one
 * caveat:
 *   - the node module must export an object with a "default" value
 */

var funnel = require('broccoli-funnel');
var esTranspiler = require('broccoli-babel-transpiler');
var resolveSourceToRelative = require('../utils/resolve-source-to-relative');

function requireModuleRelativeToProjectRoot(moduleName) {
  return require(process.cwd() + '/node_modules/' + moduleName);
}

function validateVendoredModules(vendoredModules) {
  function validate(vendoredModule) {
    var required;
    var errorMessage;
    try {
      required = requireModuleRelativeToProjectRoot(vendoredModule);
    } catch (e) {
      errorMessage = 'Unable to require vendored module "' + vendoredModule + '": ' + e;
    }
    if (required && !required['default']) {
      errorMessage = 'Vendored module "' + vendoredModule + '" missing "default" export';
    }
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  vendoredModules.forEach(validate);
}

function treeBuilder(options) {
  if (!options) {
    throw new Error('Must include options for CJS tree');
  }
  validateVendoredModules(options.vendoredModules);
  var jsSrc = options.src;
  var packageName = options.packageName;
  if (!jsSrc) {
    throw new Error('Missing options.src');
  }
  if (!packageName) {
    throw new Error('Missing options.packageName');
  }

  var tree = funnel(jsSrc, {
    destDir: '/' + packageName
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

module.exports = treeBuilder;
