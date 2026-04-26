<script lang="ts" setup>
import * as d3 from 'd3'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import type { Data, Link, Modes, Node } from "@shared/index";
import {
    createArray,
  getVertexDegrees,
  runIterativeBFS,
  runIterativeDFS,
  sleep,
  solveTask0_ComplexAnalysis,
  solveTask10_PruferEncode,
  solveTask11_PruferDecode,
  solveTask1_ShowDFS,
  solveTask7_PrimMST,
  solveTask2_ValidateDFS,
  solveTask3_ShowBFS,
  solveTask4_ValidateBFS,
  type WeightedAdjacencyList
} from "@/scripts/tasks";
import ZoomPanel from '@/components/ZoomPanel.vue';
import GraphAside from '@/components/GraphAside.vue';
import GraphHeader from '@/components/GraphHeader.vue';
import GraphTable from '@/components/GraphTable.vue';
import DeikstraTable from '@/components/DeikstraTable.vue';
import FloyedTable from '@/components/FloyedTable.vue';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { client } from '@/generated/api/client.gen';
import { useRoute } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';
import { patchSyncMutation } from '@/generated/api/@tanstack/vue-query.gen';
import type { CreateNodeMessage, EdgeMessage } from '@/generated/api';
import GreedingTable from '@/components/GreedingTable.vue';

const route = useRoute()

const resizeTimer = ref(null);
const isLoadingMode = ref<boolean>(false)
const selectedId = ref(0)
const zoomValue = ref()
const svgRef = useTemplateRef('svg')
const activeMode = ref<Modes>()
const userConnectedComponents = ref(0)
const isCheckMode = ref<boolean>(false)
const userPath = ref<string>('')

const graphId = computed<string>(() => String(route.params.graphId))

const complexAnalysisGraph = computed(() => solveTask0_ComplexAnalysis(graph.value))

const { mutate: updateGraph } = useMutation({
  ...patchSyncMutation(),
  onSuccess: () => {}
})

const mstResult = computed(() => {
  const result = solveTask7_PrimMST(graphWithWeight.value)

  let sum = 0

  for (const node of result) {
    sum += node.w ?? 0
  }

  return sum
})

const isOrdered = computed<boolean>(() => {
  let flag = true
  for (let i = 0; i < values.value.length; i++) {
    const row = values.value[i]

    if (!row) continue

    for (let j = i; j < row.length; j++) {
      const row1 = values.value[i]
      const row2 = values.value[j]

      if (!row1 || !row2) continue

      const value1 = row1[j]
      const value2 = row2[i]

      if (value1 !== value2) {
        flag = false
      }
    }
  }

  return flag
})

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function handleUpdateGraph(): void {
  const getNodeGUIDByNumberId = new Map<number, string>()

  const nodes: CreateNodeMessage[] = data.value.nodes.map((item) => {
    const { group, id: idFromItem } = item

    let id = idFromItem

    if (indexMapToNode.has(Number(id))) {
      const guid = indexMapToNode.get(Number(id))
      getNodeGUIDByNumberId.set(Number(id), guid.Id)
      id = String(guid.Id)
    } else {
      const value = uuidv4()
      getNodeGUIDByNumberId.set(Number(id), value)
      id = value
    }

    return {
      group,
      id,
      description: "",
      name: "Node name",
      assigned: [],
    }
  })

  const edges: EdgeMessage[]  = data.value.links.map((item) => {
    const { source, target, value } = item

    let fromNodeId = source
    let toNodeId = target

    if (indexMapToNode.has(Number(fromNodeId))) {
      const guid = indexMapToNode.get(Number(fromNodeId))
      fromNodeId = String(guid.Id)
    } else {
      fromNodeId = getNodeGUIDByNumberId.get(Number(fromNodeId)) ?? ''
    }

    if (indexMapToNode.has(Number(toNodeId))) {
      const guid = indexMapToNode.get(Number(toNodeId))
      toNodeId = String(guid.Id)
    } else {
      toNodeId = getNodeGUIDByNumberId.get(Number(toNodeId)) ?? ''
    }

    return { fromNodeId, toNodeId, weight: value }
  })


  updateGraph({
    body: {
      edges,
      graphId: graphId.value,
      nodes,
    }
  })
}

const loadedGraph = ref()

async function connectSSE() {
  const config = client.getConfig();

  await fetchEventSource(config.baseUrl + '/' + graphId.value + '/sse', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Accept': 'text/event-stream',
    },
    onmessage(msg) {
      loadedGraph.value = JSON.parse(msg.data)
    }
  });
}

connectSSE()

const codePrufer = computed(() => {
  console.log(values.value)
  if (!getVertexDegrees(graph.value).includes(1)) {
    return
  }
  if (!isOrdered.value) {
    return
  }

  const result = getGraph()

  console.log(result)

  return solveTask10_PruferEncode(getGraph())
})

const dfsPath = computed(() => {
  return solveTask1_ShowDFS(graph.value, selectedId.value).map((item) => Number(item))
})
const bfsPath = computed(() => {
  return solveTask3_ShowBFS(graph.value, selectedId.value).map((item) => Number(item))
})

const mstPath = computed(() => {
  return solveTask7_PrimMST(graphWithWeight.value)
})

const decodePrufer = computed(() => {
  if (!userPath.value) {
    return []
  }

  const value = userPath.value.split(' ').map((item) => Number(item))
  return solveTask11_PruferDecode(value)
})

function validateDFS(): void {
  const path = userPath.value?.split(' ').map(Number)

  if (!path) {
    alert('Введенный путь невалидный')
    return
  }

  const result = solveTask2_ValidateDFS(graph.value, selectedId.value, path)

  if (!result) {
    alert('Введенный путь неверный')
    return
  }

  alert('Введенный путь верный')
}

function validateBFS(): void {
  const path = userPath.value?.split(' ').map(Number)

  if (!path) {
    alert('Введенный путь невалидный')
    return
  }

  const result = solveTask4_ValidateBFS(graph.value, selectedId.value, path)

  if (!result) {
    alert('Введенный путь неверный')
    return
  }

  alert('Введенный путь верный')
}

function calculateIntersection(source, target, width, height) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    if (dx === 0 && dy === 0) return target;

    const hw = width / 2;
    const hh = height / 2;

    if (Math.abs(dy) * hw > Math.abs(dx) * hh) {
        const sign = dy > 0 ? -1 : 1;
        return {
            x: target.x + (dx * hh * sign) / dy,
            y: target.y + hh * sign
        };
    } else {
        const sign = dx > 0 ? -1 : 1;
        return {
            x: target.x + hw * sign,
            y: target.y + (dy * hw * sign) / dx
        };
    }
}

function render() {
  const rectWidth = 200;
  const rectHeight = 60;
  const fontSize = "12px";

  const distance = 2;
  const strength = -1000;

  const links = data.value.links.map(d => ({ ...d }))
  const nodes = data.value.nodes.map(d => ({ ...d }))

  const container = svgRef.value?.parentElement;
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width === 0 || height === 0) return;

  const svg = d3.select(svgRef.value)
      .attr("width", width)
      .attr("height", height);

  svg.selectAll("*").remove();

  const xScale = d3.scaleLinear().domain([0, 100]).range([0, Math.max(width, height) * 10]);
  const yScale = d3.scaleLinear().domain([0, 100]).range([Math.max(width, height) * 10, 0]);

  const xAxisGrid = d3.axisBottom(xScale)
      .tickSize(-10000)
      .tickFormat('')
      .ticks(200);

  const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-10000)
      .tickFormat('')
      .ticks(200);

  svg.selectAll("*").remove();

  const mainGroup = svg.append("g")
  mainGroup
    .attr("transform", zoomValue.value)

  mainGroup.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(-5000, 5000)`)
      .call(xAxisGrid);

  mainGroup.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(-5000, -5000)`)
      .call(yAxisGrid);

  svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 7)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#87898c");

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
          .id(d => d.id)
          .distance(d => (d.source.id === -1 || d.target.id === -1) ? distance * 2.5 : distance)
      )
      .force("charge", d3.forceManyBody()
          .strength(d => d.id === -1 ? strength * 4 : strength)
          .distanceMax(2000)
      )
      .force("collision", d3.forceCollide().radius(150))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05);

  const link = mainGroup.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "black")
      .attr("marker-end", "url(#arrowhead)")
      .each(function (d) {
        const el = d3.select(this)
        el.attr('data-id', d.source.id + d.target.id)
      })

  const nodeGroup = mainGroup.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  nodeGroup.append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("rx", 8)
      .attr("fill", "orange")
      .each(function (d) {
        const el = d3.select(this)
        el.attr("data-id", d.id)
      })

  const labels = nodeGroup.append("a")
      .attr("href", d => d.link)
      .attr("target", "_blank");

  labels.append("text")
      .style("font-size", "10px")
      .style("font-weight", "bold")

  nodeGroup.append("text")
      .style("font-size", fontSize)
      .each(function(d) {
          const xPos = -rectWidth / 2 + 10;
          const yPos = -8;
          const node = indexMapToNode.get(Number(d.id))
          const el = d3.select(this);
          el.append("tspan").attr("x", xPos).attr("y", yPos).text(`${node?.Name ? node.Name : '-'}`);
          el.append("tspan").attr("x", xPos).attr("dy", "1.2em").text(`id: ${d?.id ? d.id : '-'}`);
          el.append("tspan").attr("x", xPos).attr("dx", "8em").text(`due date: ${d.due_date ? d.due_date : '-'}`);
      });

  function ticked() {
      link
          .attr("x1", d => calculateIntersection(d.target, d.source, rectWidth, rectHeight).x)
          .attr("y1", d => calculateIntersection(d.target, d.source, rectWidth, rectHeight).y)
          .attr("x2", d => calculateIntersection(d.source, d.target, rectWidth, rectHeight).x)
          .attr("y2", d => calculateIntersection(d.source, d.target, rectWidth, rectHeight).y);

      nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  nodeGroup.each(function() {
    const el = d3.select(this)
    const id = el.data()[0].id

    if (id === selectedId.value) {
      el.select('rect').attr('stroke', 'red')
    } else {
      el.select('rect').attr('stroke', 'orange')
    }
  })

  nodeGroup.on("click", function() {
    const el = d3.select(this)
    const currentId = el.data()[0].id
    selectedId.value = currentId

    for (const id of nodeIds.value) {
      const el = d3.select(`[data-id="${id}"]`)

      if (selectedId.value == id) {
        el.attr('stroke', 'red')
      } else {
        el.attr('stroke', 'orange')
      }
    }
  })

  function zoomed(event) {
      zoomValue.value = event.transform
      mainGroup.attr("transform", zoomValue.value);
  }

  const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", zoomed)
      .filter(event => (!event.ctrlKey || event.type === 'wheel') && !event.button);

  svg.call(zoom);

  simulation.on("tick", ticked);

  function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
  }

  function dragged(event, d) {
      d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
  }
  d3.select('#zoom-in').on('click', () => {
      const svgEl = svgRef.value;
      const width = svgEl?.clientWidth;
      const height = svgEl?.clientHeight;
      d3.select(svgEl).transition().duration(300).call(
          zoom.scaleBy, 1.5, [width / 2, height / 2]
      );
  });

  d3.select('#zoom-out').on('click', () => {
      const svgEl = svgRef.value;
      const width = svgEl?.clientWidth;
      const height = svgEl?.clientHeight;
      d3.select(svgEl).transition().duration(300).call(
          zoom.scaleBy, 1 / 1.5, [width / 2, height / 2]
      );
  });

  d3.select('#zoom-reset').on('click', () => {
      const svgEl = svgRef.value;
      d3.select(svgEl).transition().duration(300).call(
          zoom.transform, d3.zoomIdentity
      );
  });
}

function onResize() {
  clearTimeout(resizeTimer.value);
  resizeTimer.value = setTimeout(() => {
    render();
  }, 200);
}

onMounted(() => {
  window.addEventListener('resize', onResize);
  render()
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  clearTimeout(resizeTimer.value);
});

function reset() {
  for (const id of nodeIds.value) {
    const el = d3.select(`[data-id="${id}"]`)
    el.attr('fill', 'orange')
  }
}

async function startBFS() {
  isLoadingMode.value = true
  const path = runIterativeBFS(graph.value, selectedId.value)

  for (const node of path) {
    const el = d3.select(`[data-id="${node}"]`)
    const t = d3.transition().duration(400)
    el.transition(t).attr('fill', 'black')
    await sleep(300)
  }

  isLoadingMode.value = false
}

async function startDFS() {
  isLoadingMode.value = true
  const path = runIterativeDFS(graph.value, selectedId.value)

  for (const node of path) {
    const el = d3.select(`[data-id="${node}"]`)
    const t = d3.transition().duration(400)
    el.transition(t).attr('fill', 'black')
    await sleep(300)
  }

  isLoadingMode.value = false
}

async function startMST() {
  isLoadingMode.value = true

  for (const node of mstPath.value) {
    const el1 = d3.select(`[data-id="${node.u}"]`)
    const el2 = d3.select(`[data-id="${node.v}"]`)
    const edge = d3.select(`[data-id="${node.u}${node.v}"]`)
    const t = d3.transition().duration(400)
    el1.transition(t).attr('fill', 'black')
    el2.transition(t).attr('fill', 'black')
    edge.transition(t).attr('stroke', 'yellow')
    edge.transition(t).attr('fill', 'yellow')
    edge.transition(t).attr('stroke-width', '2')
  }

  isLoadingMode.value = false
}

async function startCheckComponents() {
  if (complexAnalysisGraph.value.componentCount === Number(userConnectedComponents.value)) {
    alert('Right')
    return
  }

  alert('Wrong')
}

const graphWithWeight = computed<WeightedAdjacencyList>(() => {
  const object = {}

  for (const node of data.value.nodes) {
    object[Number(node.id)] = []
  }

  for (const link of data.value.links) {
    if (object[Number(link.source)] === null) {
      object[Number(link.source)] = [Number(link.target)]
      continue
    }

    object[Number(link.source)].push({ node: Number(link.target), weight: Number(link.value) })
  }

  const array = []

  for (const key of Object.keys(object)) {
    const value = object[key]
    array[key] = value
  }

  return array
})

function getGraph(): number[][] {
  const object = {}

  for (const node of data.value.nodes) {
    object[Number(node.id)] = []
  }

  for (const link of data.value.links) {
    if (object[Number(link.source)] === null) {
      object[Number(link.source)] = [Number(link.target)]
      continue
    }

    object[Number(link.source)].push(Number(link.target))
  }

  const array = []

  for (const key of Object.keys(object)) {
    const value = object[key]
    array[key] = value
  }

  return array
}

const values = ref<(number | undefined)[][]>([[undefined]])

const data = computed<Data>(() => {
  const object: Data = {
    nodes: [],
    links: []
  }

  for (let i = 0; i < values.value.length; i++) {
    const id = String(i)

    const node : Node = {
      group: 1,
      id
    }
    object.nodes.push(node)
  }

  for (let i = 0; i < values.value.length; i++) {
    const row = values.value[i]!
    for (let j = 0; j < row.length; j++) {
      const value = row[j]

      if (!value) {
        continue
      }

      const link: Link = {
        value,
        source: `${i}`,
        target: `${j}`,
      }

      object.links.push(link)
    }
  }

  return object
})

const graph = computed<number[][]>(() => getGraph())

const nodeIds = computed<string[]>(() => {
  return data.value.nodes.map((i) => i.id)
})

function handleStart(): void {
  if (activeMode.value === 'dfs' && isCheckMode.value) {
    validateDFS()
    return
  }

  if (activeMode.value === 'dfs') {
    startDFS()
    return
  }

  if (activeMode.value === 'bfs' && isCheckMode.value) {
    validateBFS()
    return
  }

  if (activeMode.value === 'bfs') {
    startBFS()
    return
  }

  if (activeMode.value === 'connected-components') {
    startCheckComponents()
    return
  }

  if (activeMode.value === 'prufer' && isCheckMode.value) {
    const result = processPrufer(decodePrufer.value)
    values.value = result
    return
  }

  if (activeMode.value === 'mst') {
    startMST()
    return
  }
}

function processPrufer(value: [number, number][]): (number | undefined)[][] {
  const result: (number | undefined)[][] = [[]]

  let maxNode = -1

  for (const row of value) {
    for (const el of row) {
      maxNode = Math.max(el, maxNode)
    }
  }

  for (let from = 0; from <= maxNode; from++) {
    result[from] = createArray(maxNode + 1, undefined)
  }

  for (let from = 0; from < maxNode; from++) {
    const row = value[from]

    if (!row) continue

    for (const to of row) {
      if (to === from) continue

      result[from][to] = 1
      result[to][from] = 1
    }
  }

  console.log(result)

  return result
}

const isHidedRestart = computed<boolean>(() => {
  if (activeMode.value === 'dfs') {
    return false
  }

  if (activeMode.value === 'bfs') {
    return false
  }

  return true
})

const isHidedCheckMode = computed<boolean>(() => {
  if (activeMode.value === 'dfs') {
    return false
  }

  if (activeMode.value === 'bfs') {
    return false
  }

  if (activeMode.value === 'connected-components') {
    return false
  }

  if (activeMode.value === 'prufer') {
    return false
  }

  return true
})

const nodeToIndexMap = new Map<string, number>();
const indexMapToNode = new Map<number, CreateNodeMessage>();

function parseGraph(value: {
  Edges: {
    FromNodeId: string, ToNodeId: string, Weight: number
  }[],
  Nodes: {
    Id: string
  }[]
}): (number | undefined)[][] {
  const { Nodes, Edges } = value;
  const n = Nodes.length;

  Nodes.forEach((node, index) => {
    nodeToIndexMap.set(node.Id, index);
    indexMapToNode.set(index, node)
  });

  const matrix: (number | undefined)[][] = Array.from(
    { length: n },
    () => new Array(n).fill(undefined)
  );

  for (const edge of Edges) {
    const fromIndex = nodeToIndexMap.get(edge.FromNodeId);
    const toIndex = nodeToIndexMap.get(edge.ToNodeId);

    if (fromIndex !== undefined && toIndex !== undefined) {
      matrix[fromIndex][toIndex] = edge.Weight;
    }
  }

  return matrix;
}

watch(loadedGraph, () => {
  if (loadedGraph.value) {
    const result = parseGraph(loadedGraph.value)
    values.value = result
  }
})

watch(activeMode, () => {
  if (activeMode.value === 'floyed') {
    isCheckMode.value = false
  }
  if (activeMode.value === 'deikstra') {
    isCheckMode.value = false
  }
})

watch(data, () => {
  render()
})

onMounted(() => {
  render()
})
</script>

<template>
  <div :class="$style.wrapper">
    <div :class="$style.content">
      <GraphAside v-model="activeMode" />
      <div :class="$style.block">
        <GraphHeader
          @start="handleStart"
          @restart="reset"
          @update="handleUpdateGraph"
          v-model="isCheckMode"
          :is-hided-restart="isHidedRestart"
          :is-hided-check-mode="isHidedCheckMode"
          :show-buttons="Boolean(activeMode)"
        />
        <div :class="$style.view">
          <ZoomPanel :class="$style.zoomPanel" />
          <svg ref="svg"></svg>
        </div>
      </div>
      <GraphTable
        :active-mode="activeMode"
        v-model="values"
      >
        <div :class="$style.slot" v-show="isCheckMode">
          <div
            v-show="activeMode === 'connected-components'"
            :class="$style.section"
          >
            <h3 :class="$style.title">
              Проверка количества компонент связности
            </h3>
            <input
              v-model.number="userConnectedComponents"
              type="number"
              :class="$style.input + ' ' + $style.inputNumber"
              value="0"
              placeholder="0"
            />
          </div>
          <div
            v-show="activeMode === 'dfs'"
          >
            <input
              v-model="userPath"
              :class="$style.input"
              placeholder="Введите собственный путь DFS"
            />
          </div>
          <div
            v-show="activeMode === 'bfs'"
          >
            <input
              v-model="userPath"
              :class="$style.input"
              placeholder="Введите собственный путь BFS"
            />
          </div>
          <div
            v-if="activeMode === 'prufer'"
            :class="$style.section"
          >
            <h3 :class="$style.text">
              Введите код прюфера <br />
              (результат подставится в таблицу)
            </h3>
            <input
              v-model="userPath"
              :class="$style.input"
              placeholder="Введите код прюфера для декодирования"
            />
          </div>
        </div>
        <div v-show="!isCheckMode">
          <div
            v-show="activeMode === 'greeding'"
            :class="$style.section"
          >
            <h3 :class="$style.title">
              Вывод покраски:
            </h3>
            <GreedingTable :values="graph" />
          </div>
          <div
            v-show="activeMode === 'complex'"
            :class="$style.section"
          >
            <h3 :class="$style.title">
              Комплексный анализ
            </h3>
            <div>
              <p
                :class="$style.text"
              >
                Количество компонентов связанности: {{ complexAnalysisGraph.componentCount }}
              </p>
              <p
                :class="$style.text"
              >
                Степени вершин: {{ complexAnalysisGraph.degrees }}
              </p>
              <p
                :class="$style.text"
              >
                Эйлеровость: {{ complexAnalysisGraph.euler }}
              </p>
              <p
                :class="$style.text"
              >
                Двудольность: {{ complexAnalysisGraph.isBipartite ? 'Есть' : 'Нет' }}
              </p>
              <p
                :class="$style.text"
              >
                Полная двудольность: {{ complexAnalysisGraph.isCompleteBipartite ? 'Есть' : 'Нет' }}
              </p>
            </div>
          </div>
          <div
            v-show="activeMode === 'dfs'"
            :class="$style.section"
          >
            <p
              :class="$style.text"
            >
              Обход DFS: {{ dfsPath }}
            </p>
          </div>
          <div
            v-show="activeMode === 'bfs'"
            :class="$style.section"
          >
            <p
              :class="$style.text"
            >
              Обход BFS: {{ bfsPath }}
            </p>
          </div>
          <div
            v-show="activeMode === 'connected-components'"
            :class="$style.section"
          >
            <p
              :class="$style.text"
            >
              Количество компонент связности: {{ complexAnalysisGraph.componentCount }}
            </p>
          </div>
          <p
            v-if="activeMode === 'prufer'"
            :class="$style.text"
          >
            Код прюфера: {{ codePrufer }}
          </p>
          <div
            v-show="activeMode === 'deikstra'"
            :class="$style.section"
          >
            <h3 :class="$style.title">
              Результат работы дейкстры:
            </h3>
            <DeikstraTable :selected-id="selectedId" :values="graphWithWeight" />
          </div>
          <div
            v-show="activeMode === 'floyed'"
            :class="$style.section"
          >
            <h3 :class="$style.title">
              Результат работы Флойда:
            </h3>
            <FloyedTable :values="graphWithWeight" />
          </div>
          <p
            v-show="activeMode === 'mst'"
            :class="$style.text"
          >
            Сумма рёбер: {{ mstResult }}
          </p>
          <p
            v-show="activeMode === undefined"
            :class="$style.text"
          >
            Выберите задачу
          </p>
        </div>
      </GraphTable>
    </div>
  </div>
</template>

<style module>
.wrapper {
  height: 100%;
}

.block {
  height: 100%;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #b5b5b529;
}

.content {
  display: grid;
  grid-template-columns: 0.7fr 2fr 1fr;
  height: 100%;
}

.content text {
  font-size: 12px;
  fill: white;
  font-weight: bold;
}

.aside {
  position: relative;
}

.row {
  display: flex;
  gap: 8px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.userInput {
  border: none;
  outline: none;
  padding: 8px 12px;
  border-radius: 4px;
}

p {
  color: white;
}

.zoomPanel {
  position: absolute;
  top: 12px;
  right: 12px;
}

.title {
  font-size: 24px;
  color: var(--text-color);
  font-weight: 400;
}

.text {
  font-size: 20px;
  color: var(--text-color);
}

.input {
  width: 100%;
  font-size: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.inputNumber {
  width: 60px;
  height: 40px;
}
</style>

<style>
.grid line {
  stroke: lightgrey;
  stroke-opacity: 0.7;
  shape-rendering: crispEdges;
  vector-effect: non-scaling-stroke;
}

.grid path {
  stroke-width: 0;
}
</style>
