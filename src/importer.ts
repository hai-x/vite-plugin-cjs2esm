import { Node } from 'acorn'
import { DynamicImporter, Importer, ResolveOptions } from './types/index'

export const resolveImporters = (
  importers: Importer[]
): (Importer & { prepend: string; overwrites: ResolveOptions })[] => {
  let index = 0
  return importers.map(importer => {
    const { start, end } = importer
    const name = `__IMPORTER_${index++}__`
    const from = (
      importer as Importer & { arguments: (Node & { value: string })[] }
    )?.arguments?.[0]?.value
    return {
      ...importer,
      prepend: `import * as ${name} from "${from}";`,
      overwrites: [
        {
          start,
          end,
          content: `${name}.default || ${name}`
        }
      ]
    }
  })
}

export const resolveDynamicImporters = (
  dynamicImporters: DynamicImporter[]
): (DynamicImporter & {
  prepend?: string
  overwrites?: ResolveOptions
  appendLefts?: ResolveOptions
  appendRights?: ResolveOptions
})[] => {
  return dynamicImporters.map(importer => {
    const { context, callee } = importer
    const { varName, parentScope } = context
    if (parentScope?.type) {
      const thenable = `.then((${varName}) => {`
      const res = {
        ...importer,
        overwrites: [
          {
            start: callee.start,
            end: callee.end,
            content: `import`
          },
          {
            start: callee.start,
            end: callee.end,
            content: `import`
          }
        ],
        appendLefts: [
          {
            start: parentScope.end - 1,
            content: `});\n`
          }
        ],
        appendRights: [
          {
            start: callee.end + 1,
            content: `/* @vite-ignore */`
          },
          {
            start: importer.end,
            content: thenable
          }
        ]
      }
      return res
    }
    return importer
  })
}
