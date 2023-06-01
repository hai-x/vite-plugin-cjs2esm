import { Exporter, ResolveOptions } from './types/index'

export const resolveExporters = (
  exporters: Exporter[]
): (Exporter & {
  overwrites: ResolveOptions
  append?: string
})[] => {
  let index = 0

  return exporters.map(exporter => {
    const name = `__EXPORTER_${index++}__`
    const { start, end } = exporter.left
    let overwrite: string | undefined
    let append: string | undefined
    if (exporter?.left?.type === 'MemberExpression') {
      if (exporter.left.object?.name === 'exports') {
        const propertyName = exporter.left.property?.name
        overwrite = `const ${name}`
        append = `\nexport { ${name} as ${propertyName} };`
      } else if (
        exporter.left.object?.name === 'module' &&
        exporter.left.property?.name === 'exports'
      ) {
        overwrite = `const ${name}`
        append = `\nexport { ${name} as default };`
      }
    }

    return {
      ...exporter,
      overwrites: [{ start, end, content: overwrite }],
      append
    }
  })
}
