var dirExistsSync = require('./dir-exists-sync');

function validateOptions(options) {
  var libDir = options.libDirName;
  if (!dirExistsSync(libDir)) {
    throw new Error('libDir "' + libDir + '" could not be found. ' +
                    'If your source is in a different dir, ' +
                    'specify with `options.libDirName`');
  }

  if (!options.packageName) {
    throw new Error('options.packageName must be specified');
  }
}

module.exports = validateOptions;
