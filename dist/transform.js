import MagicString from 'magic-string';
import { parse } from 'acorn';
import { resolveImporters } from './importer';
import { ancestor } from 'acorn-walk';
import { resolveExporters } from './exporter';
const transform = (source, id) => {
    let ast;
    const importers = [];
    const exporters = [];
    try {
        ast = parse(source, {
            sourceType: 'module',
            ecmaVersion: 2020
        });
    }
    catch (error) {
        // ignore as it might not be a JS file, the subsequent plugins will catch the error
        return source;
    }
    ancestor(ast, {
        CallExpression(node, ancestors) {
            const isCjsImporter = node.callee.name === 'require';
            isCjsImporter &&
                importers.push({
                    ...node,
                    ancestors
                });
        },
        AssignmentExpression(node) {
            //  `module.exports`, `exports.xxx`
            const isCjsExporter = node.left.type === 'MemberExpression' &&
                (node.left.object.name === 'exports' ||
                    (node.left.object.name === 'module' &&
                        node.left.property.name === 'exports'));
            isCjsExporter && exporters.push(node);
        }
    });
    const ms = new MagicString(source);
    for (const importer of resolveImporters(importers)) {
        const { prepend, overwrite, start, end } = importer;
        overwrite && ms.overwrite(start, end, overwrite);
        prepend && ms.prepend(`${prepend}\n`);
    }
    for (const exporter of resolveExporters(exporters)) {
        const { append, overwrite, start, end } = exporter;
        overwrite && ms.overwrite(start, end, overwrite);
        append && ms.append(`${append}\n`);
    }
    return ms.toString();
};
export default transform;
