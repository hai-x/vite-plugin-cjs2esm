import { Node } from 'acorn'
import {
  DEFAULT_EXTENSIONS,
  VITE_REG,
  COMMON_JS_REG,
  PARENT_SCOPE_AST_TYPE,
  VARIABLE_AST_TYPE
} from './constants'
import path from 'node:path'

export const isCommonJs = (source: string): boolean => {
  return COMMON_JS_REG.test(source)
}

const getAstNode = (ancestors: Node[], AST_TYPE_REG: RegExp): Node | null => {
  let lastIndex = ancestors.length - 1
  while (lastIndex) {
    const ancestor = ancestors[lastIndex--]
    if (AST_TYPE_REG.test(ancestor.type)) {
      return ancestor
    }
  }
  return null
}

export const getParentScopeAstNode = (ancestors: Node[]): Node | null => {
  return getAstNode(ancestors, PARENT_SCOPE_AST_TYPE)
}

export const getVariableDeclarationAstNode = (
  ancestors: Node[]
): Node | null => {
  return getAstNode(ancestors, VARIABLE_AST_TYPE)
}

export const skipTransform = (source: string, id: string) => {
  if (!DEFAULT_EXTENSIONS.includes(path.extname(id))) return true
  else if (VITE_REG.test(id)) return true
  else if (!isCommonJs(source)) return true
  return false
}

export const getVariableDeclaratorIdName = (
  callExpression: Node,
  variableDeclaration: Node & {
    declarations?: (Node & {
      init?: Node
      id?: {
        name?: string
      }
    })[]
  }
): string | undefined => {
  const declarator = variableDeclaration?.declarations?.[0]
  if (declarator?.init == callExpression) {
    return declarator.id?.name
  }
}
