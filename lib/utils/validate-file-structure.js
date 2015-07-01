var path = require('path');
var fileExistsSync = require('./file-exists-sync');

function validateIndexJS(options) {
  var libDir = options.libDirName;
  var indexJsPath = path.join(libDir, 'index.js');
  if (!fileExistsSync(indexJsPath)) {
    throw new Error('Expected to find index.js at "' + indexJsPath + '"');
  }
}

function validatePackageJSON(options) {
  var outputPath = path.join('dist', 'commonjs', options.packageName, 'index.js');
  var packagePath = path.join(process.cwd(), 'package.json');
  var packageJSON = require(packagePath);

  if (!packageJSON.main) {
    throw new Error('Package.json must define "main" for CJS build');
  }
  if (packageJSON.main !== outputPath) {
    throw new Error('Package.json must define a valid value of "main". Got "' + packageJSON.main + '", expected "' + outputPath + '"');
  }
}

module.exports = function validateFileStructure(validateOptions, buildOptions) {
  validateIndexJS(buildOptions);

  if (validateOptions.validatePackageJSON) {
    validatePackageJSON(buildOptions);
  }
};
