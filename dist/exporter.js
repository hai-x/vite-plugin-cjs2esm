export const resolveExporters = (exporters) => {
    let index = 0;
    return exporters.map(exporter => {
        const name = `__EXPORTER_${index++}__`;
        let overwrite;
        let append;
        if (exporter.left.type === 'MemberExpression') {
            if (exporter.left.object.name === 'exports') {
                const propertyName = exporter.left.property.name;
                overwrite = `export const ${propertyName}`;
            }
            else if (exporter.left.object.name === 'module' &&
                exporter.left.property.name === 'exports') {
                overwrite = `const ${name}`;
                append = `export default ${name};`;
            }
        }
        return {
            ...exporter,
            start: exporter.left.start,
            end: exporter.left.end,
            overwrite,
            append
        };
    });
};
