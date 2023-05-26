export const resolveImporters = (importers) => {
    let index = 0;
    return importers.map(importer => {
        const name = `__IMPORTER_${index++}__`;
        const from = importer?.arguments?.[0]?.value;
        return {
            ...importer,
            prepend: `import * as ${name} from "${from}";`,
            overwrite: `${name}.default || ${name}`
        };
    });
};
