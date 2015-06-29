# broccoli-multi-builder

The idea:

  * write es6 code
  * use broccoli-multi-builder to build amd, window global or cjs output
  * consume other code (via `import "my-other-codebase"`) in your src es6 code, have it work seamlessly with building for any of the output formats

### Notes

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
  * in your own `src/` es6 code, it should be fine to import default (`import X from "other-package"`) and named exports (`import { namedThing} from "other-package"`)
  * you **must not** import from anywhere but the module root path (i.e. cannot `import X from "other-package/thing"`)
