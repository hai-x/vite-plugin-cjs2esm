import { skipTransform } from './utils';
import { default as _transform } from './transform';
import fs from 'node:fs/promises';
const defaultOptions = {
    filter: /.*/
};
export const vitePlugin = (options) => {
    const _options = Object.assign({}, defaultOptions, options);
    const { filter } = _options;
    return {
        apply: 'serve',
        name: 'vite:cjs2esm',
        transform(source, id) {
            if (!skipTransform(source, id) && filter.test(id)) {
                const _source = _transform(source, id);
                console.log(_source);
                return {
                    code: _source,
                    map: null,
                    warnings: null
                };
            }
            return null;
        }
    };
};
export const esbuildPlugin = (options) => {
    const _options = Object.assign({}, defaultOptions, options);
    const { filter } = _options;
    return {
        name: 'esbuild:cjs2esm',
        setup(build) {
            build.onLoad({ filter }, async (args) => {
                const { path: id } = args;
                let source;
                try {
                    source = await fs.readFile(id, 'utf8');
                }
                catch (error) {
                    return null;
                }
                if (!skipTransform(source, id)) {
                    source = _transform(source, id);
                    return {
                        contents: source,
                        loader: 'js'
                    };
                }
                return null;
            });
        }
    };
};
