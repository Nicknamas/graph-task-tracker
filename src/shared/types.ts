export interface Node {
  id: string
  group: number
}

export interface Link {
  source: string
  target: string
  value: number
}

export interface Data {
  links: Link[]
  nodes: Node[]
}

export type Modes = 'dfs' | 'bfs' | 'connected-components' | undefined
