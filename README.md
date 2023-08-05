# vite-plugin-cjs2esm

🤩 A vite plugin that transform CommonJS to ESModule in Development stage.

# Installation

```bash
yarn add vite-plugin-cjs2esm --save-dev
# or
npm install vite-plugin-cjs2esm --save-dev
# or
pnpm install vite-plugin-cjs2esm --save-dev
```

# Usage

In your vite.config.ts:

```js
import { defineConfig } from 'vite'
import viteCjsToEsmPlugin from 'vite-plugin-cjs2esm'

export default defineConfig({
  plugins: [viteCjsToEsmPlugin.vitePlugin()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [viteCjsToEsmPlugin.esbuildPlugin()]
    }
  }
})
```

# Options

### filter

Type: `RegExp`<br> Default: `/.*/`<br>

Files to include in this plugin (default all).

# Features

1. `static require`

```js
// input
const foo = require('./foo')
// ↓ ouput
import * as __IMPORTER_0__ from './foo'
const foo = __IMPORTER_0__.default || __IMPORTER_0__
```

2. `exports`

```js
// input
exports.foo = foo
// ↓ ouput
const __EXPORTER_0__ = foo
export { __EXPORTER_0__ as foo }
```

```js
// input
module.exports = foo
// ↓ ouput
const __EXPORTER_0__ = foo
export { __EXPORTER_0__ as default }
```

3.`dynamic require`

```js
// input
function bar(file) {
  const foo = require(`./foo/${file}`)
  console.log(foo)
}
bar('bar')
// ↓ output
function bar(file) {
  const foo = import(`./foo/${file}`).then(foo => {
    console.log(foo)
  })
}
bar('foo')
```
