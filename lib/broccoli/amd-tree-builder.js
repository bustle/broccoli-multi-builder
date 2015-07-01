/* jshint node:true */
'use strict';

/*
 * in order to `import` an npm module from the es6 source it must:
 *  - be listed in the vendored node modules
 *  - have its own "lib" dir locally that contains es6 code
 */

var funnel = require('broccoli-funnel');
var esTranspiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var concat = require('broccoli-concat');
var resolveSourceToAbsolute = require('../utils/resolve-source-to-absolute');
var vendoredTreeBuilder = require('./vendored-tree-builder');
var amdLoader = require('broccoli-amd-loader');
var validateOptions = require('../utils/validate-options');
var stew = require('broccoli-stew');

function treeBuilder(options) {
  validateOptions(options);

  var libDir = options.libDirName,
      packageName = options.packageName;

  var outputFileName = options.outputFileName || packageName;
  outputFileName += '.js';
  var outputDir = options.isGlobal ? 'global' : 'amd';
  var outputPath = outputDir + '/' + outputFileName;

  // put in a destDir with the same package name as the name of the moduleRoot
  // that we want so that named modules become <moduleRoot>/filename aka
  // "content-kit-editor/filename"
  var tree = funnel(libDir, {
    destDir: '/' + packageName
  });

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

  var concatOptions = {
    inputFiles: [
      '**/*.js'    // from our transpiled js from src
    ],
    outputFile: '/' + outputPath
  };

  var vendoredTree = vendoredTreeBuilder.build(options.vendoredModules);
  var treesToMerge = [tree, vendoredTree];

  if (options.loader) {
    tree = amdLoader(tree, {
      destDir: '/loader.js'
    });
    tree = stew.tree(tree);
    concatOptions.inputFiles.unshift('loader.js/loader.js');
  }
  tree = mergeTrees(treesToMerge);

  if (options.isGlobal) {
    var registerGlobal = options.registerGlobalExport;
    concatOptions.header = '(function() {\n';
    concatOptions.footer = [
      'require("' + packageName + '")["' + registerGlobal + '"](window, document);',
      '})();'
    ].join('\n');
  }

  tree = concat(tree, concatOptions);
  return tree;
}

module.exports = {
  build: treeBuilder
};
