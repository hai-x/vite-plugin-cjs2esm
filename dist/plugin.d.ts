import type { Plugin } from 'vite';
import type { Options } from './types/index';
export declare const vitePlugin: (options: Options) => Plugin;
export declare const esbuildPlugin: (options: Options) => {
    name: string;
    setup(build: any): void;
};
