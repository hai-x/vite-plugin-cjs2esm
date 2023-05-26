import { Node } from 'acorn';
export declare const resolveExporters: (exporters: (Node & any)[]) => (Node & {
    overwrite: string;
    append: string;
})[];
