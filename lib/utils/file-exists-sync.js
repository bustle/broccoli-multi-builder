/* jshint node:true */
var existsSync = require('exists-sync');

module.exports = function fileExistsSync(filePath) {
  return existsSync(filePath);
};
