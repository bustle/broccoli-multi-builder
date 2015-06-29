/* jshint node:true */

/**
 * convert an absolute source import to a relative one
 * expects filenames to start with <sourceRoot>
 *
source: 'sourceRoot/file', filename: 'cke/index.js' -> './file'
source: 'sourceRoot/helpers/xyz', filename: 'cke/tests/t.js' -> '../helpers/xyz'
source: 'sourceRoot/helpers/../xyz', filename: 'cke/tests/t.js' -> '../xyz'
source 'sourceRoot/relative-file' filename 'content-kit-editor/index.js' -> './relative-file'
*/
function resolveSourceToRelative(source, filename, sourceRoot) {
  var isAbsolute = source.indexOf(sourceRoot) === 0;
  if (!isAbsolute) {
    return source;
  }
  if (filename.indexOf(sourceRoot) !== 0) {
    throw new Error('Expected filename "' + filename + '" to start with sourceRoot (' + sourceRoot + ')');
  }

  var path = require('path');

  var sourceParts = source.split('/');
  sourceParts.shift(); // remove sourceRoot
  var fileParts = path.dirname(filename).split('/');
  fileParts.shift(); // remove sourceRoot

  var relativeParts = [];
  for (var i=0; i<fileParts.length; i++) {
    relativeParts.push('..');
  }

  relativeParts = relativeParts.concat(sourceParts);
  var relativePath = path.normalize(relativeParts.join('/'));
  if (relativePath.indexOf('..') === -1) {
    relativePath = './' + relativePath;
  }
  return relativePath;
}

module.exports = resolveSourceToRelative;
