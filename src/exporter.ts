import { Exporter, ResolveOptions } from './types/index'

export const resolveExporters = (
  exporters: Exporter[]
): Partial<
  Exporter & {
    overwrites?: ResolveOptions
    append?: string
  }
>[] => {
  let index = 0
  let needAppendDefaultExport = true
  const _exportsNames: string[] = []
  const _exporters: ReturnType<typeof resolveExporters> = exporters.map(
    exporter => {
      const name = `__EXPORTER_${index++}__`
      const { start, end } = exporter.left
      let overwrite: string | undefined
      let append: string | undefined
      if (exporter?.left?.type === 'MemberExpression') {
        if (exporter.left.object?.name === 'exports') {
          const propertyName = exporter.left.property?.name
          overwrite = `const ${name}`
          append = `\nexport { ${name} as ${propertyName} };`
          _exportsNames.push(`${propertyName}: ${name}`)
        } else if (
          exporter.left.object?.name === 'module' &&
          exporter.left.property?.name === 'exports'
        ) {
          needAppendDefaultExport = false
          overwrite = `const ${name}`
          append = `\nexport { ${name} as default };`
        }
      }

      return {
        ...exporter,
        overwrites: [{ start, end, content: overwrite }],
        append
      }
    }
  )
  // adapt to Vite internal module transform that default import from cjs in node_modules
  // Vite will wrap cjs module by import `__vite__cjsImport__` which is default import
  // import __vite__cjsImport__ from "/node_modules/.vite/deps/xxxx"
  if (needAppendDefaultExport) {
    _exporters.push({
      append: `\nconst __DEFAULT_EXPORTER__ = { ${_exportsNames.join(
        ','
      )} }\nexport default __DEFAULT_EXPORTER__`
    })
  }
  return _exporters
}
