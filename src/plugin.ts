import type { Plugin } from 'vite'
import { skipTransform } from './utils'

import type { Options } from './types/index'
import { default as _transform } from './transform'
import fs from 'node:fs/promises'

const defaultOptions = {
  filter: /.*/
}

export const vitePlugin = (options: Options): Plugin => {
  const _options = Object.assign({}, defaultOptions, options)
  const { filter } = _options
  return {
    apply: 'serve',
    name: 'vite:cjs2esm',
    transform(source, id) {
      if (!skipTransform(source, id) && filter.test(id)) {
        const _source = _transform(source, id)
        console.log(_source)

        return {
          code: _source,
          map: null,
          warnings: null
        }
      }
      return null
    }
  }
}

export const esbuildPlugin = (options: Options) => {
  const _options = Object.assign({}, defaultOptions, options)
  const { filter } = _options
  return {
    name: 'esbuild:cjs2esm',
    setup(build: any) {
      build.onLoad({ filter }, async (args: any) => {
        const { path: id } = args
        let source: string
        try {
          source = await fs.readFile(id, 'utf8')
        } catch (error) {
          return null
        }
        if (!skipTransform(source, id)) {
          source = _transform(source, id)
          return {
            contents: source,
            loader: 'js'
          }
        }
        return null
      })
    }
  }
}
