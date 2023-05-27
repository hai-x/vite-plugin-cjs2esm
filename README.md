# vite-plugin-cjs2esm

🤩 A vite plugin that transform CommonJS to ESM during development stage.

You can use `@rollup/plugin-commonjs` which is a rollup plugin to transform
CommonJS to ESM during production stage.

Because Vite bundle by esbuild during development stage and rollup during
production stage.

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
import cjs2esm from 'vite-plugin-cjs2esm'
// https://vitejs.dev/config/
export default defineConfig({
  // ...
  plugins: [
    // ...
    cjs2esm()
  ]
})
```

# Features

```js
// input
const foo = require('./foo')
// ↓ ouput
import * as __IMPORTER_0__ from './foo'
const foo = __IMPORTER_0__.default || __IMPORTER_0__
```

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
