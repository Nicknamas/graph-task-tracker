import { client } from "@/generated/api/client.gen";

export type AdjacencyList = number[][]; // [0:[1,2,3]]
export interface WeightedEdge {
  node: number;
  weight: number;
} // Посути интерфейс взвешанной вершины.
export type WeightedAdjacencyList = WeightedEdge[][]; //типа [0:[{node:1,weight:5}]]

export function createArray<T>(length: number, value: T): T[] {
  const arr = new Array(length);
  for (let i = 0; i < length; i++) arr[i] = value;
  return arr;
}

export const setToken = (token: string | undefined = undefined) => {
  if (token) {
    localStorage.setItem('accessToken', token)
  }

  client.setConfig({
    baseUrl: import.meta.env.VITE_API,
    auth() {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        return
      }

      return token
    }
  })
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function getVertexDegrees(adj: AdjacencyList): number[] {
  const degrees = [];
  for (let i = 0; i < adj.length; i++) degrees.push(adj[i].length);
  return degrees;
}

export function runIterativeDFS(
  adj: AdjacencyList,
  start: number,
  visitedGlobal?: boolean[],
): number[] {
  const visited = visitedGlobal || createArray(adj.length, false);
  const path: number[] = [];
  const stack = [start];

  while (stack.length > 0) {
    const v = stack.pop()!;
    if (!visited[v]) {
      visited[v] = true;
      path.push(v);
      for (let i = adj[v].length - 1; i >= 0; i--) {
        const n = adj[v][i];
        if (!visited[n]) stack.push(n);
      }
    }
  }
  return path;
}

export function runIterativeBFS(
  adj: AdjacencyList,
  start: number,
  visitedGlobal?: boolean[],
): number[] {
  const visited = visitedGlobal || createArray(adj.length, false);
  const path: number[] = [];
  const queue = [start];
  visited[start] = true;

  while (queue.length > 0) {
    const v = queue.shift()!;
    path.push(v);
    for (let i = 0; i < adj[v].length; i++) {
      const n = adj[v][i];
      if (!visited[n]) {
        visited[n] = true;
        queue.push(n);
      }
    }
  }
  return path;
}

export function getConnectedComponents(adj: AdjacencyList): number[][] {
  const visited = createArray(adj.length, false);
  const components = [];
  for (let i = 0; i < adj.length; i++) {
    if (!visited[i]) components.push(runIterativeDFS(adj, i, visited));
  }
  return components;
}

// Алгоритм раскраски, еслиможно раскрасить в 2 цвета - Двудольный
export function getBipartiteColoring(adj: AdjacencyList): number[] | null {
  const colors = createArray(adj.length, -1);
  for (let i = 0; i < adj.length; i++) {
    if (colors[i] === -1) {
      const q = [i];
      colors[i] = 0;
      while (q.length > 0) {
        const u = q.shift()!;
        for (let j = 0; j < adj[u].length; j++) {
          const v = adj[u][j];
          if (colors[v] === -1) {
            colors[v] = 1 - colors[u];
            q.push(v);
          } else if (colors[v] === colors[u]) return null;
        }
      }
    }
  }
  return colors;
}

export function solveTask0_ComplexAnalysis(adj: AdjacencyList) {
  const degrees = getVertexDegrees(adj);
  const components = getConnectedComponents(adj);
  const colors = getBipartiteColoring(adj);

  // Эйлеровость
  const activeComps = components.filter((c) => c.length > 1);
  let oddCount = 0;
  for (let i = 0; i < degrees.length; i++) if (degrees[i] % 2 !== 0) oddCount++;
  const euler =
    activeComps.length <= 1
      ? oddCount === 0
        ? "Эйлеров"
        : oddCount === 2
          ? "Полуэйлеров"
          : "Нет"
      : "Нет";

  // Полная двудольность
  let isCompleteBipartite = false;
  if (colors) {
    const setA = [],
      setB = [];
    for (let i = 0; i < colors.length; i++) colors[i] === 0 ? setA.push(i) : setB.push(i);
    if (setA.length > 0 && setB.length > 0) {
      isCompleteBipartite =
        setA.every((v) => adj[v].length === setB.length) &&
        setB.every((v) => adj[v].length === setA.length);
    }
  }

  return {
    degrees,
    componentCount: components.length,
    euler,
    isBipartite: !!colors,
    isCompleteBipartite,
  };
}

export function solveTask1_ShowDFS(adj: AdjacencyList, start: number) {
  return runIterativeDFS(adj, start);
}

export function solveTask2_ValidateDFS(
  adj: AdjacencyList,
  start: number,
  userPath: number[],
): boolean {
  if (userPath[0] !== start) return false;
  const visited = createArray(adj.length, false);
  const stack = [userPath[0]];
  visited[userPath[0]] = true;

  for (let i = 1; i < userPath.length; i++) {
    const next = userPath[i];
    let found = false;
    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      if (adj[curr].indexOf(next) !== -1 && !visited[next]) {
        visited[next] = true;
        stack.push(next);
        found = true;
        break;
      } else stack.pop();
    }
    if (!found) return false;
  }
  return true;
}

export function solveTask3_ShowBFS(adj: AdjacencyList, start: number) {
  return runIterativeBFS(adj, start);
}

export function solveTask4_ValidateBFS(
  adj: AdjacencyList,
  start: number,
  userPath: number[],
): boolean {
  if (userPath[0] !== start) return false;
  const visited = createArray(adj.length, false);
  const parentInPathIdx = createArray(adj.length, -1);
  visited[start] = true;

  for (let i = 0; i < userPath.length; i++) {
    const curr = userPath[i];
    for (let j = 0; j < adj[curr].length; j++) {
      const n = adj[curr][j];
      if (!visited[n]) {
        visited[n] = true;
        parentInPathIdx[n] = i;
      }
    }
  }
  let lastP = 0;
  for (let i = 1; i < userPath.length; i++) {
    const pIdx = parentInPathIdx[userPath[i]];
    if (pIdx < lastP || pIdx === -1) return false;
    lastP = pIdx;
  }
  return true;
}

export function solveTask5_6_Components(adj: AdjacencyList, userCount?: number) {
  const realCount = getConnectedComponents(adj).length;
  return userCount === undefined ? realCount : realCount === userCount;
}

export function solveTask7_PrimMST(adj: WeightedAdjacencyList) {
  const n = adj.length,
    mst = [],
    minE = createArray(n, Infinity),
    parent = createArray(n, -1),
    visited = createArray(n, false);
  if (n > 0) minE[0] = 0;
  for (let i = 0; i < n; i++) {
    let v = -1;
    for (let j = 0; j < n; j++) if (!visited[j] && (v === -1 || minE[j] < minE[v])) v = j;
    if (v === -1 || minE[v] === Infinity) break;
    visited[v] = true;
    if (parent[v] !== -1) mst.push({ u: parent[v], v, w: minE[v] });
    for (let k = 0; k < adj[v].length; k++) {
      const e = adj[v][k];
      if (!visited[e.node] && e.weight < minE[e.node]) {
        minE[e.node] = e.weight;
        parent[e.node] = v;
      }
    }
  }
  return mst;
}

export function solveTask8_Dijkstra(adj: WeightedAdjacencyList, start: number) {
  const dist = createArray(adj.length, Infinity),
    visited = createArray(adj.length, false);
  dist[start] = 0;
  for (let i = 0; i < adj.length; i++) {
    let v = -1;
    for (let j = 0; j < adj.length; j++) if (!visited[j] && (v === -1 || dist[j] < dist[v])) v = j;
    if (v === -1 || dist[v] === Infinity) break;
    visited[v] = true;
    for (let k = 0; k < adj[v].length; k++) {
      const e = adj[v][k];
      if (dist[v] + e.weight < dist[e.node]) dist[e.node] = dist[v] + e.weight;
    }
  }
  return dist;
}

export function solveTask9_FloydWarshall(adj: WeightedAdjacencyList) {
  const n = adj.length,
    dist: number[][] = [];
  for (let i = 0; i < n; i++) {
    dist[i] = createArray(n, Infinity);
    dist[i][i] = 0;
    for (let j = 0; j < adj[i].length; j++) dist[i][adj[i][j].node] = adj[i][j].weight;
  }
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
  return dist;
}

export function solveTask10_PruferEncode(adj: AdjacencyList) {
  const n = adj.length,
    deg = getVertexDegrees(adj),
    tempAdj = adj.map((r) => [...r]),
    code = [];
  for (let i = 0; i < n - 2; i++) {
    let leaf = -1;
    for (let j = 0; j < n; j++)
      if (deg[j] === 1) {
        leaf = j;
        break;
      }
    const neighbor = tempAdj[leaf].find((v) => deg[v] > 0)!;
    code.push(neighbor);
    deg[leaf] = 0;
    deg[neighbor]--;
    tempAdj[neighbor] = tempAdj[neighbor].filter((v) => v !== leaf);
  }
  return code;
}

export function solveTask11_PruferDecode(code: number[]): [number, number][] {
  const n = code.length + 2,
    deg = createArray(n, 1);
  for (let i = 0; i < code.length; i++) deg[code[i]]++;
  const edges: [number, number][] = [];
  for (let i = 0; i < code.length; i++) {
    for (let j = 0; j < n; j++) {
      if (deg[j] === 1) {
        edges.push([code[i], j]);
        deg[code[i]]--;
        deg[j]--;
        break;
      }
    }
  }
  const last = [];
  for (let i = 0; i < n; i++) if (deg[i] === 1) last.push(i);
  edges.push([last[0], last[1]]);
  return edges;
}

export function solveTask12_GreedyColoring(adj: AdjacencyList) {
  const res = createArray(adj.length, -1),
    avail = createArray(adj.length, true);
  res[0] = 0;
  for (let u = 1; u < adj.length; u++) {
    for (let i = 0; i < adj[u].length; i++)
      if (res[adj[u][i]] !== -1) avail[res[adj[u][i]]] = false;
    let color = 0;
    while (!avail[color]) color++;
    res[u] = color;
    for (let i = 0; i < avail.length; i++) avail[i] = true;
  }
  return res;
}
