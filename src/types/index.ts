import type { Node } from 'acorn'

export type ImporterNode = Node & { ancestors: Node[] }

export type Options = {
  filter?: RegExp
}
