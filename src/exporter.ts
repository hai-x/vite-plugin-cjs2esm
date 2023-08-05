import { Exporter, ResolveOptions } from './types/index'

// const filterDuplicateExporters = (
//   exporters: Exporter[]
// ): {
//   noDuplicateExporters: Exporter[]
//   duplicateExporters: Exporter[]
// } => {
//   const propertyNameSet = new Set()

//   const noDuplicateExporters: Exporter[] = []
//   const duplicateExporters: Exporter[] = []

//   for (let i = exporters.length - 1; i >= 0; i--) {
//     const propertyName = exporters[i].left.property?.name
//     if (propertyNameSet.has(propertyName)) {
//       duplicateExporters.push(exporters[i])
//       continue
//     }
//     propertyNameSet.add(propertyName)
//     noDuplicateExporters.push(exporters[i])
//   }
//   return {
//     noDuplicateExporters,
//     duplicateExporters
//   }
// }

export const resolveExporters = (
  exporters: Exporter[]
): Partial<
  Exporter & {
    overwrites?: ResolveOptions
    append?: string
  }
>[] => {
  let index = 0
  // const needAppendDefaultExport = true
  // const _exportsNames: string[] = []
  // const { duplicateExporters, noDuplicateExporters } =
  //   filterDuplicateExporters(exporters)
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
          // _exportsNames.push(`${propertyName}: ${name}`)
        } else if (
          exporter.left.object?.name === 'module' &&
          exporter.left.property?.name === 'exports'
        ) {
          // needAppendDefaultExport = false
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
  // if (needAppendDefaultExport) {
  //   _exporters.push({
  //     append: `\nconst __DEFAULT_EXPORTER__ = { ${_exportsNames.join(
  //       ','
  //     )} }\nexport default __DEFAULT_EXPORTER__`
  //   })
  // }

  // hack to multiple duplicate exports
  // like following:
  // exports.foo = 'foo'
  // exports.foo = 'bar'
  // the last exports takes effect acquiescently
  // if (duplicateExporters.length) {
  //   duplicateExporters.forEach(exporter => {
  //     const propertyName = exporter.left.property?.name
  //     const overwrite = `let ${propertyName}_REWRITE_${index}`
  //     _exporters.push({
  //       overwrites: [
  //         { start: exporter.start, end: exporter.end, content: overwrite }
  //       ]
  //     })
  //   })
  // }
  return _exporters
}
