var funnel = require('broccoli-funnel');
var defaults = require('lodash/object/defaults');
var path = require('path');
var dirExistsSync = require('../utils/dir-exists-sync');
//var stew = require('broccoli-stew');
var mergeTrees = require('broccoli-merge-trees');
var resolveSourceToAbsolute = require('../utils/resolve-source-to-absolute');
var esTranspiler = require('broccoli-babel-transpiler');

var defaultVendorOptions = {
  libDirName: 'lib'
};

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

function getVendoredModuleName(moduleNameOrObject) {
  if (typeof moduleNameOrObject === 'string') {
    return moduleNameOrObject;
  } else {
    var name = moduleNameOrObject.name;
    if (!name) {
      throw new Error('Missing name for vendoredModule options: ' + moduleNameOrObject);
    }
    return name;
  }
}

function getVendoredModuleNames(vendoredModules) {
  return vendoredModules.map(getVendoredModuleName);
}

function getVendoredModuleOptions(moduleNameOrObject) {
  var moduleOptions = {};
  if (typeof moduleNameOrObject === 'object') {
    moduleOptions = moduleNameOrObject.options;
  }
  return defaults(moduleOptions, defaultVendorOptions);
}

function validateVendoredImport(importName, fromFile, vendoredModuleNames) {
  var isAbsoluteImport = importName.indexOf('.') !== 0;

  if (!isAbsoluteImport) {
    return;
  }

  var hasVendoredModule = vendoredModuleNames.indexOf(importName) !== -1;

  if (!hasVendoredModule) {
    throw new Error('Attempted import of vendored module "' + importName + '" but this is not a listed dependency. (It may be a secondary dependency.) Add it to your list of vendored modules. (From: "' + fromFile + '")');
  }
}

function buildFromVendoredModules(vendoredModules) {
  var vendoredTrees = vendoredModules.map(function(moduleNameOrObject) {
    var moduleName = getVendoredModuleName(moduleNameOrObject);
    var moduleOptions = getVendoredModuleOptions(moduleNameOrObject);
    return buildVendoredTree(moduleName, moduleOptions);
  });

  vendoredTrees = mergeTrees(vendoredTrees);
  var vendoredModuleNames = getVendoredModuleNames(vendoredModules);

  return esTranspiler(vendoredTrees, {
    moduleIds: true,
    modules: 'amdStrict',

    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    },
    resolveModuleSource: function (source, filename) {
      validateVendoredImport(source, filename, vendoredModuleNames);
      return resolveSourceToAbsolute(source, filename);
    }
  });
}

module.exports = {
  build: buildFromVendoredModules,
  getVendoredModuleNames: getVendoredModuleNames
};
