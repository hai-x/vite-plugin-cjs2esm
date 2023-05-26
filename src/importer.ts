import { Node } from 'acorn'
import { ImporterNode } from './types/index'

export const resolveImporters = (
  importers: ImporterNode[]
): (ImporterNode & { prepend: string; overwrite: string })[] => {
  let index = 0
  return importers.map(importer => {
    const name = `__IMPORTER_${index++}__`
    const from = (
      importer as ImporterNode & { arguments: (Node & { value: string })[] }
    )?.arguments?.[0]?.value
    return {
      ...importer,
      prepend: `import * as ${name} from "${from}";`,
      overwrite: `${name}.default || ${name}`
    }
  })
}
