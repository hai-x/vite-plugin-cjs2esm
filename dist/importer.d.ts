import { ImporterNode } from './types/index';
export declare const resolveImporters: (importers: ImporterNode[]) => (ImporterNode & {
    prepend: string;
    overwrite: string;
})[];
