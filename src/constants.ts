export const DEFAULT_EXTENSIONS = [
  '.mjs',
  '.js',
  '.mts',
  '.ts',
  '.jsx',
  '.tsx',
  '.json'
]

export const VITE_REG = /.vite/

export const COMMON_JS_REG =
  /\b(require|module\.exports|exports\.\w+|exports\s*=\s*|exports\s*\[.*\]\s*=\s*)/

export const PARENT_SCOPE_AST_TYPE =
  /ArrowFunctionExpression|FunctionDeclaration/

export const VARIABLE_AST_TYPE = /VariableDeclaration/
