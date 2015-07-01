var vendoredTreeBuilder = require('../broccoli/vendored-tree-builder');
var getVendoredModuleNames = vendoredTreeBuilder.getVendoredModuleNames;
var path = require('path');

function requireModuleRelativeToProjectRoot(moduleName) {
  var relativePath = path.join(process.cwd(), 'node_modules', moduleName);
  return require(relativePath);
}

function validateVendoredModules(vendoredModules) {
  var moduleNames = getVendoredModuleNames(vendoredModules);

  function validate(moduleName) {
    var required;
    var errorMessage;
    try {
      required = requireModuleRelativeToProjectRoot(moduleName);
    } catch (e) {
      errorMessage = 'Unable to require vendored module "' + moduleName + '": ' + e;
    }
    if (required && !required['default']) {
      errorMessage = 'Vendored module "' + moduleName + '" missing "default" export';
    }
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  moduleNames.forEach(validate);
}


module.exports = validateVendoredModules;
