/* jshint node:true */
var lstatSync = require('fs').lstatSync;
var existsSync = require('exists-sync');

function dirExistsSync(dir) {
  if (!existsSync(dir)) {
    return false;
  }
  var fStats = lstatSync(dir);
  return fStats.isDirectory();
}

module.exports = dirExistsSync;
