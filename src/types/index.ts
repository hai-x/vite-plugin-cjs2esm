import type { Node } from 'acorn'

export type Importer = Node & { ancestors: Node[]; callee: Node }

export type Exporter = Node & {
  left: Node & {
    object?: {
      name: string
    }
    property?: {
      name: string
    }
  }
}

export type DynamicImporter = Importer & {
  context: {
    varName: string
    parentScope: Node
  }
}

export type Options = {
  filter?: RegExp
}

export type ResolveOption = {
  start: number
  end: number
  content?: string
}

export type ResolveOptions = ResolveOption[]
