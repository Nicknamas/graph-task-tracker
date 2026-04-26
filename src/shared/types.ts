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

export type Modes = 'mst' | 'greeding' | 'complex' | 'dfs' | 'bfs' | 'connected-components' | 'prufer' | 'deikstra' | 'floyed' | undefined
