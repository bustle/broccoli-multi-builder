/* jshint node:true */

/*
 * in order to `import` an npm module from the es6 source it must:
 *  - be listed in the vendored node modules
 *  - have its own "src" dir locally that contains es6 code
 */

var funnel = require('broccoli-funnel');
var esTranspiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var concat = require('broccoli-concat');
var resolveSourceToAbsolute = require('../utils/resolve-source-to-absolute');
var dirExistsSync = require('../utils/dir-exists-sync');
var stew = require('broccoli-stew');

function vendoredSrcTree(vendoredModules) {
  function createTreeFor(vendoredModule) {
    var srcDirName = 'src';
    var vendorSrc = './node_modules/' + vendoredModule + '/' + srcDirName;
    if (!dirExistsSync(vendorSrc)) {
      throw new Error('Expected vendored module "' + vendoredModule + '"to include src dir "' + srcDirName + '"');
    }
    return funnel(vendorSrc, {
      destDir: '/' + vendoredModule
    });
  }

  var vendoredTrees = vendoredModules.map(createTreeFor);
  return mergeTrees(vendoredTrees);
}

function loaderTree() {
  var loaderSrcDir = __dirname + '/../../node_modules/loader.js';
  var tree = funnel(loaderSrcDir, {
    include: ['loader.js'],
    destDir: '/loader.js'
  });
  return tree;
}

function treeBuilder(options) {
  if (!options) {
    throw new Error('Must include options for AMD tree');
  }
  var jsSrc = options.src;
  var packageName = options.packageName;
  if (!jsSrc) {
    throw new Error('Missing options.src');
  }
  if (!packageName) {
    throw new Error('Missing options.packageName');
  }

  var outputFileName = '/' + packageName;
  if (options.isGlobal) {
    outputFileName += '.js';
  } else {
    outputFileName += '.amd.js';
  }

  // put in a destDir with the same package name as the name of the moduleRoot
  // that we want so that named modules become <moduleRoot>/filename aka
  // "content-kit-editor/filename"
  var tree = funnel(jsSrc, {
    destDir: '/' + packageName
  });

  tree = mergeTrees([tree, vendoredSrcTree(options.vendoredModules)]);

  tree = esTranspiler(tree, {
    moduleIds: true,
    modules: 'amdStrict',

    // Transforms /index.js files to use their containing directory name
    getModuleId: function (name) {
      return name.replace(/\/index$/, '');
    },
    resolveModuleSource: function (source, filename) {
      return resolveSourceToAbsolute(source, filename);
    }
  });

  tree = mergeTrees([tree, loaderTree()]);

  var concatOptions = {
    inputFiles: [
      'loader.js/loader.js', // from loaderTree
      '**/*.js'    // from our transpiled js from src
    ],
    outputFile: outputFileName
  };

  if (options.isGlobal) {
    concatOptions.header = '(function() {\n';
    concatOptions.footer = [
      'require("' + packageName + '")["registerGlobal"](window);',
      '})();'
    ].join('\n');
  }

  tree = concat(tree, concatOptions);
  return tree;
}

module.exports = treeBuilder;
