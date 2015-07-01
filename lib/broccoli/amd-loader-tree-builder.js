var funnel = require('broccoli-funnel');
var path = require('path');

module.exports = {
  build: function buildLoaderTree() {
    var loaderDir = path.dirname(require.resolve('loader.js'));
    var tree = funnel(loaderDir, {
      include: ['loader.js'],
      destDir: '/loader.js'
    });
    return tree;
  }
};
