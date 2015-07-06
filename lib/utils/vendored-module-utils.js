var defaults = require('lodash/object/defaults');
var defaultVendorOptions = {
  libDirName: 'lib'
};

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
    moduleOptions = moduleNameOrObject.options || {};
  }
  return defaults(moduleOptions, defaultVendorOptions);
}

function validateVendoredImport(importName, fromFile, vendoredModuleNames, packageName) {
  var isAbsoluteImport = importName.indexOf('.') !== 0;

  if (!isAbsoluteImport) {
    return;
  }

  var importRoot = importName.split('/')[0];

  // we are importing from our own package with an absolute path
  if (importRoot === packageName) {
    return;
  }

  var hasVendoredModule = vendoredModuleNames.indexOf(importRoot) !== -1;

  if (!hasVendoredModule) {
    throw new Error('Attempted absolute import of "' + importName + '" but this is not a listed dependency. (It may be a secondary dependency.) Add it to your list of vendored modules. (From: "' + fromFile + '")');
  }
}

function isVendoredImport(importName, vendoredModuleNames) {
  var importRoot = importName.split('/')[0];
  return vendoredModuleNames.indexOf(importRoot) !== -1;
}


module.exports = {
  getName: getVendoredModuleName,
  getNames: getVendoredModuleNames,
  getOptions: getVendoredModuleOptions,
  validateImport: validateVendoredImport,
  isVendoredImport: isVendoredImport
};
