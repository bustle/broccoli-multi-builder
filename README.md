# broccoli-multi-builder

The idea:

  * write es6 code
  * use broccoli-multi-builder to build amd, window global or cjs output
  * consume other code (via `import "my-other-codebase"`) in your src es6 code, have it work seamlessly with building for any of the output formats

### Usage

To build your es6 code using `broccoli-multi-builder`:

  * install and save it: `npm install --save-dev broccoli-multi-builder`
  * install the broccoli cli tool: `npm install --global broccoli-cli`
  * install broccoli-merge-trees: `npm install --save-dev broccoli-merge-trees`

Add a `Brocfile.js` in the root of your project with the following code:
```
var multiBuilder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');

var amdOptions = {
  src: 'path/to/es6/src/directory',
  isGlobal: false,
  packageName: 'my-package', // influences the name of the built file and directories,
                             // and the source root for the amd modules
  vendoredModules: [] // the npm package names of any other modules that your es6 code
                      // consumes. Those packages must have a file/directory structure
                      // as described below
};

var cjsOptions = {
  src: 'path/to/es6/src/directory',
  // isGlobal is not relevant for a cjs build
  packageName: 'my-package',
  vendoredModules: [] // same as the vendored modules for the amdOptions
}

module.exports = mergeTrees([
  multiBuilder.buildAMD(amdOptions),
  multiBuilder.buildCJS(cjsOptions)
]);
```

Then do a `broccoli build dist` to put your cjs and amd output into `dist/`.
Note that broccoli will complain about writing to a directory that already exists
so you may need to `rm -rf dist` first.

Read more about [broccoli.js here](https://github.com/broccolijs/broccoli).

#### Caveats

If you are writing code:

  * it must be in `src/` written is es6 style (import/export)

If you are writing code for another package that uses broccoli-multi-builder to consume:

  * you should be sure to publish your raw (es6) `src/` to npm and:
  * you should include your built cjs output when publishing to npm (`./dist/<packageName>` with `dist/<packageName>/index.js`)
  * your `index.js` above should export a `default` (this is what a consumer will get if they `import X from "your-package"` -- this happens automatically if you build with broccoli-multi-builder)
  * your package.json `"main"` entry should point to `dist/<packageName>/index.js`

If you are consuming another library built with broccoli-multi-builder:

  * install it using `npm install other-package`
  * add its name to the array of `vendoredModules` that you pass to the `buildAMD` or `buildCJS` methods in your Brocfile
  * in your own `src/` es6 code, it should be fine to import default (`import X from "other-package"`) and named exports (`import { namedThing} from "other-package"`)
  * you **must not** import from anywhere but the module root path (i.e. cannot `import X from "other-package/thing"`) of a vendored module
