import { vitePlugin, esbuildPlugin } from './plugin'
import { transform } from './transform'

const Plugin = {
  vitePlugin,
  esbuildPlugin,
  transform
}

export {
  vitePlugin as viteCjsToEsmPlugin,
  esbuildPlugin as esbuildCjsToEsmPlugin,
  transform as transformCjsToEsm
}

export default Plugin
