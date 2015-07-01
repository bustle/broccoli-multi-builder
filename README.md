# broccoli-multi-builder

## Who this is for

This is for library authors who want to:

  * Write ES6/ES7 source code (and use its imports/exports for code organization)
  * Publish their code in a browser-friendly format (AMD or Global) and/or a Node-friendly format (CommonJS)
  * Consume other libraries (via `import "other-codebase"`) in their source code and still be able to publish to the above formats

## Caveats

  * Dependency depth of 1
     * this lib does not yet support vendored modules that themselves depend on other modules, however:
     * if each vendored module also adheres to the conventions below, then you can list all of them in `vendoredModules` and it should still work fine
  * Can only import from a vendored module's top-level namespace (aka `import X from "other-pkg"` is fine, but `import X from "other-pkg/nested/thing"` is not)
  * Dependencies are installed from npm (and their code is therefore in the `node_modules/` dir)

## Conventions

### General

  * source code is written in es6 with import/export statements
  * source code is in a top-level `/lib` dir (configurable via option `libDirName`)
  * published commonjs code goes into `dist/commonjs/<packageName>/`
  * published AMD code goes into `dist/amd/<packageName>.js` (the filename is configurable via option `outputFileName`)
  * published globals code goes into `dist/global/<packageName>.js` (the filename is configurable via option `outputFileName`)
  * the source code (`/lib`) must also published to npm (so that it can be consumed by libraries that depend on this one, see below)
  * dependencies are explicitly declared when building and:
     * dependencies also adhere to these conventions (with some additional caveats, below)

### AMD-specific

  * dependencies must also be written in es6 with import/export statements
  * dependencies' source code is in a `lib/` dir (configurable) in that dependency's published npm package
    * this is necessary because when broccoli-multi-builder builds your project for AMD it
      transpiles and bundles the dependencie's source as well, so it must be present
  * An AMD loader is not included by default (to include one, set `options.loader = true`)
  * The AMD output file is not wrapped in an IIFE

### Globals-specific

  * The globals build takes the AMD tree and:
    * includes the [loader.js](https://www.npmjs.com/package/loader.js) AMD loader
    * in the bottom of the file, appends `require('<packageName>')["registerGlobal"](window, document);`
    * wraps the file in an IIFE
    * It expects that your package will export a function called `registerGlobal` that it can call with the arguments `(window, document)`. To override this set `options.registerGlobalExport` to a different string. The `registerGlobal` named export from your index.js is where you would do something like `window.MyPackageName = X;` in order to allow a third-party to use your library as the global `MyPackageName`.

### CommonJS-specific

  * The "main" file in your package.json must point to "dist/commonjs/<packageName>/index.js" (broccoli-multi-builder will check for this)
  * Third parties who use your library via commonjs will only be able to `require('your-package-name');`. `require` calls for sub-directories (like `require('your-package/thing');`) will not work properly due to the way node's module require system works (it looks for paths relative to the directory root, not relative to the location of the "main" file) and the fact that broccoli-multi-builder publishes your commonJS code in `dist/commonjs`.
  * The CommonJS build does not attempt to bundle any of the listed vendoredModule dependencies (those should be listed in this library's package.json `dependencies` so that the transpiled code can use node's standard `require` mechanism to bring them in)

### Publishing conventions

#### For other users of broccoli-multi-builder

In order to publish your npm module so that another library that uses broccoli-multi-builder can consume it, you
must:

  * put your es6 source code in lib/
  * have a `lib/index.js` that provides the default export for your library
  * be sure to include your `lib/` code when publishing to npm

#### For browser-based users

Browser-based users can download your library via `npm install <your-package-name>` and find
the format they prefer ("amd" or "global") available as a single file in the "dist/` directory, and
include that in their project via a mechanism of their choice.

Optionally, you may want to publish via bower as well.

#### For node-based users

Node-based users can install your library via `npm install <your-package-name>` and then simply
`require('your-package-name');` in their code. Node's standard `require` mechanism will take care of
including any other dependencies at that point (although these must be listed in your package.json `dependencies`).

## Usage

To build your es6-based library using `broccoli-multi-builder` for amd, global or commonjs output:

  * install and save broccoli-multi-builder: `npm install --save-dev broccoli-multi-builder`
  * install the broccoli cli tool: `npm install --global broccoli-cli`
  * install broccoli-merge-trees: `npm install --save-dev broccoli-merge-trees`

Add a `Brocfile.js` file in the root of your project with the following code:
```
var multiBuilder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');

var amdOptions = {
  libDirName: 'path/to/es6/src/directory', // default: 'lib'
  packageName: 'my-package', // influences the name of the built file and directories,
                             // and the source root for the amd modules
  vendoredModules: [] // the npm package names of any other modules that your es6 code
                      // consumes. Those packages must have a file/directory structure
                      // as described below
};

var globalOptions = {
  libDirName: 'path/to/es6/src/directory', // default: 'lib'
  registerGlobalExport: 'registerGlobal', // default: 'registerGlobal'
  packageName: 'my-package', // influences the name of the built file and directories,
                             // and the source root for the amd modules
  vendoredModules: [] // the npm package names of any other modules that your es6 code
                      // consumes. Those packages must have a file/directory structure
                      // as described below
};

var cjsOptions = {
  libDirName: 'path/to/es6/src/directory', // default: 'lib'
  packageName: 'my-package',
  vendoredModules: [] // same as the vendored modules for the amdOptions
}

module.exports = mergeTrees([
  multiBuilder.build('amd', amdOptions),
  multiBuilder.build('global', globalOptions),
  multiBuilder.build('commonjs', cjsOptions)
]);
```

Then do a `broccoli build dist` to put your cjs and amd output into `dist/`.
Note that broccoli will complain about writing to a directory that already exists
so you may need to `rm -rf dist` first.

Read more about [broccoli.js here](https://github.com/broccolijs/broccoli).

## Caveats

If you are consuming another library built with broccoli-multi-builder:

  * install it using `npm install other-package`
  * add its name to the array of `vendoredModules` that you pass to the `build` method in your Brocfile
  * in your own `lib/` es6 code, it should be fine to import default (`import X from "other-package"`) and named exports (`import { namedThing} from "other-package"`)
  * you **must not** import from anywhere but the module root path (i.e. cannot `import X from "other-package/thing"`) of a vendored module

Remember that npm automatically ignores everything in your `.gitignore` file, so if you
are sensibly ignoring the built artifacts that show up in your `dist/` directory, you will need
to create an `.npmignore` file that does **not** list `dist/` so that npm will not ignore `dist/` when
you publish. Also, remember to build into your `dist/` directory before publishing a new version of your library.
