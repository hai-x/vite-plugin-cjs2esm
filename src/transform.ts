import MagicString from 'magic-string'
import type { Node } from 'acorn'
import { parse } from 'acorn'
import { resolveDynamicImporters, resolveImporters } from './importer'
import { ancestor } from 'acorn-walk'
import type { Importer, DynamicImporter, Exporter } from './types/index'
import { resolveExporters } from './exporter'
import {
  getParentScopeAstNode,
  getVariableDeclarationAstNode,
  getVariableDeclaratorIdName
} from './utils'

const transform = (source: string): string | null => {
  let ast: Node
  const importers: Importer[] = []
  const dynamicImporters: DynamicImporter[] = []
  const exporters: Exporter[] = []
  try {
    ast = parse(source, {
      sourceType: 'module',
      ecmaVersion: 2020
    }) as Node
  } catch (error) {
    console.error(error)
    return null
  }

  ancestor(ast, {
    CallExpression(node: Node & any, ancestors: (Node & any)[]) {
      const isCjsImporter =
        node.callee.name === 'require' && node.arguments?.length === 1
      if (isCjsImporter) {
        // If static import => node.arguments.[0].type === 'Literal'
        const isDynamic = node.arguments[0].type !== 'Literal'
        if (isDynamic) {
          const variableDeclarationAstNode =
            getVariableDeclarationAstNode(ancestors)
          const varName = variableDeclarationAstNode
            ? getVariableDeclaratorIdName(node, variableDeclarationAstNode)
            : null
          dynamicImporters.push({
            ...node,
            context: {
              varName,
              parentScope: { ...getParentScopeAstNode(ancestors) }
            },
            ancestors: ancestors.map(i => {
              const { type, start, end } = i
              return {
                type,
                start,
                end
              }
            })
          })
        } else {
          importers.push({
            ...node,
            ancestors: ancestors.map(i => {
              const { type, start, end } = i
              return {
                type,
                start,
                end
              }
            })
          })
        }
      }
    },
    AssignmentExpression(node: Node & any) {
      //  `module.exports`, `exports.xxx`
      const isCjsExporter =
        node.left.type === 'MemberExpression' &&
        (node.left.object.name === 'exports' ||
          (node.left.object.name === 'module' &&
            node.left.property.name === 'exports'))
      isCjsExporter && exporters.push(node)
    }
  })

  const ms = new MagicString(source)

  for (const importer of resolveImporters(importers)) {
    const { prepend, overwrites } = importer
    if (Array.isArray(overwrites))
      for (const i of overwrites) {
        i && i.content && ms.overwrite(i.start, i.end, i.content)
      }

    prepend && ms.prepend(`${prepend}\n`)
  }

  for (const importer of resolveDynamicImporters(dynamicImporters)) {
    const { overwrites, appendLefts, appendRights } = importer
    if (Array.isArray(overwrites))
      for (const i of overwrites) {
        i && i.content && ms.overwrite(i.start, i.end, i.content)
      }
    if (Array.isArray(appendLefts))
      for (const i of appendLefts) {
        i && i.content && ms.appendLeft(i.start, i.content)
      }
    if (Array.isArray(appendRights))
      for (const i of appendRights) {
        i && i.content && ms.appendRight(i.start, i.content)
      }
  }
  for (const exporter of resolveExporters(exporters)) {
    const { append, overwrites } = exporter
    if (Array.isArray(overwrites))
      for (const i of overwrites) {
        i && i.content && ms.overwrite(i.start, i.end, i.content)
      }
    append && ms.append(`${append}\n`)
  }
  return ms.toString()
}

export default transform
