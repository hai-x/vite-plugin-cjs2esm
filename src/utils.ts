import { DEFAULT_EXTENSIONS, VITE_REG, COMMON_JS_REG } from './contants'
import path from 'node:path'

export const isCommonJs = (source: string): boolean => {
  return COMMON_JS_REG.test(source)
}

export const skipTransform = (source: string, id: string) => {
  if (!DEFAULT_EXTENSIONS.includes(path.extname(id))) return true
  else if (VITE_REG.test(id)) return true
  else if (!isCommonJs(source)) return true
  return false
}
