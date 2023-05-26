import { Plugin } from 'vite';

type Options = {
    filter?: RegExp;
};

declare const vitePlugin: (options: Options) => Plugin;
declare const esbuildPlugin: (options: Options) => {
    name: string;
    setup(build: any): void;
};

export { vitePlugin as default, esbuildPlugin, vitePlugin };
