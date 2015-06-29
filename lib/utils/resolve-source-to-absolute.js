/* jshint node:true */
/**
 * convert relative import to absolute import
source: '../file', filename: 'cke/index.js' -> 'cke/file'
source: '../helpers/xyz', filename: 'cke/tests/t.js' -> 'cke/tests/helpers/xyz'
source: '../helpers/../xyz', filename: 'cke/tests/t.js' -> 'cke/tests/xyz'
source './relative-file' filename 'content-kit-editor/index.js' -> 'content-kit-editor/relative-file'
*/
function resolveSourceToAbsolute(source, filename) {
  var isRelativeImport = source.indexOf('.') !== -1;
  if (!isRelativeImport) {
    return source;
  }

  var path = require('path');
  var sourceParts = source.split('/');
  var fileParts = path.dirname(filename).split('/');

  var sourcePart = sourceParts.shift();
  while (sourcePart) {
    if (sourcePart === '..') {
      fileParts.pop();
    } else if (sourcePart !== '.') {
      fileParts.push(sourcePart);
    }

    sourcePart = sourceParts.shift();
  }
  return fileParts.join('/');
}

module.exports = resolveSourceToAbsolute;
