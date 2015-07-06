var funnel = require('broccoli-funnel');
var path = require('path');
var dirExistsSync = require('../utils/dir-exists-sync');
var mergeTrees = require('broccoli-merge-trees');
var resolveSourceToAbsolute = require('../utils/resolve-source-to-absolute');
var esTranspiler = require('broccoli-babel-transpiler');
var moduleUtils = require('../utils/vendored-module-utils');

function buildVendoredTree(moduleName, options) {
  var libDirName = options.libDirName;
  var cwd = process.cwd();
  var libDir = path.join(cwd, 'node_modules', moduleName, libDirName);


  if (!dirExistsSync(libDir)) {
    throw new Error('Expected vendored module "' + moduleName + '" to include lib dir at "' + libDir + '"');
  }

  return funnel(libDir, {
    destDir: '/' + moduleName
  });
}

function buildFromVendoredModules(vendoredModules) {
  var vendoredTrees = vendoredModules.map(function(moduleNameOrObject) {
    var moduleName = moduleUtils.getName(moduleNameOrObject);
    var moduleOptions = moduleUtils.getOptions(moduleNameOrObject);
    return buildVendoredTree(moduleName, moduleOptions);
  });

  vendoredTrees = mergeTrees(vendoredTrees);
  var vendoredModuleNames = moduleUtils.getNames(vendoredModules);

  return esTranspiler(vendoredTrees, {
    moduleIds: true,
    modules: 'amdStrict',

    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    },
    resolveModuleSource: function (source, filename) {
      moduleUtils.validateImport(source, filename, vendoredModuleNames);
      return resolveSourceToAbsolute(source, filename);
    }
  });
}

module.exports = {
  build: buildFromVendoredModules
};
