<script lang="ts" setup>
import * as d3 from 'd3'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import type { Data, Link, Modes, Node } from "@shared/index";
import {
  runIterativeBFS,
  runIterativeDFS,
  sleep,
  solveTask0_ComplexAnalysis,
  solveTask10_PruferEncode,
  solveTask11_PruferDecode,
  solveTask12_GreedyColoring,
  solveTask2_ValidateDFS,
  solveTask4_ValidateBFS,
  solveTask8_Dijkstra,
  solveTask9_FloydWarshall,
  type WeightedAdjacencyList
} from "@/scripts/tasks";
import ZoomPanel from '@/components/ZoomPanel.vue';
import GraphAside from '@/components/GraphAside.vue';

const width = ref(420)
const resizeTimer = ref(null);
const isLoadingMode = ref<boolean>(false)
const selectedId = ref(0)
const zoomValue = ref()
const svgRef = useTemplateRef('svg')
const activeMode = ref<Modes>()

const firstTask = computed(() => solveTask0_ComplexAnalysis(graph.value))

const inputedPath = computed<number[]>(() => userInput.value.split(' ').map((item: string) => Number(item)))
const pruferInput = ref<string>('')
const codePrufer = computed(() => {
  return solveTask10_PruferEncode(graph.value)
})
const decodePrufer = computed(() => {
  if (!pruferInput.value) {
    return []
  }

  const value = pruferInput.value.split(' ').map((item) => Number(item))
  return solveTask11_PruferDecode(value)
})

function validateDFS(): void {
  const result = solveTask2_ValidateDFS(graph.value, selectedId.value, inputedPath.value)

  if (!result) {
    alert('Введенный путь невалидный')
    return
  }

  alert('Введенный путь верный')
}

function validateBFS(): void {
  const result = solveTask4_ValidateBFS(graph.value, selectedId.value, inputedPath.value)

  if (!result) {
    alert('Введенный путь невалидный')
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

const deikstra = computed(() => {
  return solveTask8_Dijkstra(graphWithWeight.value, selectedId.value)
})

const flowyed = computed(() => {
  return solveTask9_FloydWarshall(graphWithWeight.value)
})

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
      .ticks(100);

  const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-10000)
      .tickFormat('')
      .ticks(100);

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
      .attr("stroke-opacity", 0.6)
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
          const yPos = 5;
          const el = d3.select(this);
          el.append("tspan").attr("x", xPos).attr("y", yPos).text(`id: ${d.id ? d.id : '-'}`);
          el.append("tspan").attr("x", xPos).attr("dy", "1.2em").text(`time: ${d.estimate ? d.estimate : '-'}`);
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

  d3.select('#reset').on("click", () => {
    for (const id of nodeIds.value) {
      const el = d3.select(`[data-id="${id}"]`)
      el.attr('fill', 'orange')
    }
  })

  d3.select('#bfs').on("click", async () => {
    isLoadingMode.value = true
    const path = runIterativeBFS(graph.value, selectedId.value)

    for (const node of path) {
      const el = d3.select(`[data-id="${node}"]`)
      const t = d3.transition().duration(400)
      el.transition(t).attr('fill', 'black')
      await sleep(300)
    }

    isLoadingMode.value = false
  })

  d3.select('#dfs').on("click", async () => {
    isLoadingMode.value = true
    const path = runIterativeDFS(graph.value, selectedId.value)

    for (const node of path) {
      const el = d3.select(`[data-id="${node}"]`)
      const t = d3.transition().duration(400)
      el.transition(t).attr('fill', 'black')
      await sleep(300)
    }

    isLoadingMode.value = false
  })

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

  // d3.select('#ost').on("click", async () => {
  //   isLoadingMode.value = true
  //   const path = solveTask7_PrimMST(graphWithWeight.value)
  //
  //   for (const node of path) {
  //     const el = d3.select(`[data-id="${node}"]`)
  //     const el = d3.select(`[data-id="${node}"]`)
  //     const t = d3.transition().duration(400)
  //     el.transition(t).attr('fill', 'black')
  //     await sleep(300)
  //   }
  //
  //   isLoadingMode.value = false
  // })
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

const graphWithWeight = computed<WeightedAdjacencyList>(() => {
  const object = {}

  for (const node of data.value.nodes) {
    object[Number(node.id)] = [{ node: Number(node.id), weight: 0 }]
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

const graph = computed<number[][]>(() => {
  const object = {}

  for (const node of data.value.nodes) {
    object[Number(node.id)] = [Number(node.id)]
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
})

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

const nodeIds = computed<string[]>(() => {
  return data.value.nodes.map((i) => i.id)
})

function addNode(): void {
  const lengthRow = values.value[0]?.length

  if (!lengthRow) return

  if (lengthRow > 19) {
    return
  }

  const newRow = []

  for (const row of values.value) {
    row.push(undefined)
  }

  for (let i = 0; i < lengthRow + 1; i++) {
    newRow.push(undefined)
  }

  values.value.push(newRow)
}

function deleteNode(): void {
  for (const row of values.value) {
    row.pop()
  }

  values.value.pop()
}

const currentPosition = ref<{ x: number | undefined, y: number | undefined }>({
  x: undefined,
  y: undefined
})

const userInput = ref<string>()

function handleCheckComponent(): void {
  if (Number(userInput.value) == firstTask.value.componentCount) {
    alert('ALL GOOD')
    return
  }

  alert('BAD')
}

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
      <div :class="$style.view">
        <ZoomPanel :class="$style.zoomPanel" />
        <svg ref="svg"></svg>
      </div>
      <div :class="$style.aside + ' ' + $style.row + ' ' + $style.aside_right" :style="{ width: width + 'px' }">
        <div
          :class="$style.lineResize"
        />
        <div :class="$style.block">
          <table :class="$style.table" >
            <thead>
              <tr>
                <th></th>
                <th
                  v-for="(_, index) of values"
                  :key="index"
                  :data-active="currentPosition.x === index"
                >
                  {{ index }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, indexY) of values"
                :key="indexY"
              >
                <th
                  :data-active="currentPosition.y === indexY"
                >
                  {{ indexY }}
                </th>
                <td
                  v-for="(_, indexX) in row.length"
                  :key="indexX"
                  :data-active="currentPosition.y === indexY || currentPosition.x === indexX"
                >
                  <input
                    v-model.number="row[indexX]"
                    :class="$style.input"
                    placeholder="0"
                    @mouseenter="currentPosition= { x: indexX, y: indexY }"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <p>Дейкстра</p>
          <p>Пути от вершины {{ selectedId }} до остальных</p>
          <div :class="$style.row">
            <p
              v-for="(item, index) of deikstra"
              :key="index"
            >
              {{ index }}: {{ item }}
            </p>
          </div>
          <table :class="$style.table" >
            <thead>
              <tr>
                <th></th>
                <th
                  v-for="(_, index) of flowyed.length"
                  :key="index"
                >
                  {{ index }}
                </th>
              </tr>
            </thead>
            <p>Флойд: </p>
            <tbody>
              <tr
                v-for="(row, indexY) of flowyed"
                :key="indexY"
              >
                <th>
                  {{ indexY }}
                </th>
                <td
                  v-for="(_, indexX) in row.length"
                  :key="indexX"
                >
                  <p>{{ row[indexX] }}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <p>Код прюфера: {{ codePrufer }}</p>
          <input v-model="pruferInput" type="text" />
          <p>Декодированный прюфер: {{ decodePrufer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style module>
@import url('@/styles/reset.css');

.view {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #b5b5b529;
}

.content {
  display: grid;
  grid-template-columns: 0.7fr 2fr auto;
  height: 100%;
}

.content text {
  font-size: 12px;
  fill: white;
  font-weight: bold;
}

.aside {
  position: relative;
  background-color: rgb(34, 36, 37);
}

.aside_right {
  flex-grow: 1;
}

.aside_padding {
  padding: 20px;
}

.lineResize {
  position: absolute;
  left: 0;
  height: 100%;
  width: 13px;
  cursor: pointer;

}

.lineResize::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(50% - 6px);
  background-color: blue;
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

.table {
  border-collapse: collapse;
  height: fit-content;
  width: fit-content;

  th, td {
    text-align: center;
  }

  tbody tr:first-child td {
    border-top: 1px solid black;

    input {
      border-start-start-radius: 0;
      border-start-end-radius: 0;
    }
  }

  tbody tr:last-child td {
    border-bottom: 1px solid black;

    input {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
    }
  }

  tbody tr td:first-of-type {
    border-left: 1px solid black;

    input {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
  }

  tbody tr td:last-of-type {
    border-right: 1px solid black;

    input {
      border-end-end-radius: 0;
      border-start-end-radius: 0;
    }
  }

  th {
    width: 32px;
    height: 32px;
    font-size: 20px;
    font-weight: 400;
    opacity: 60%;
    color: white;
  }

  th, td {
    transition: 0.2s;
  }

  td {
    input {
      border-radius: 4px;
    }
  }

  th[data-active="true"] {
    background-color: orange;
    color: white;
  }

  td:hover {
    input {
      background-color: darkorange;
      color: white;
    }
    input::placeholder {
      color: white;
    }
  }
}

.userInput {
  border: none;
  outline: none;
  padding: 8px 12px;
  border-radius: 4px;
}

.input {
  text-align: center;
  width: 32px;
  transition: 0.2s;
  height: 100%;
  border: none;
}

p {
  color: white;
}

.zoomPanel {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>

<style>
.grid line {
  stroke: lightgrey;
  stroke-opacity: 0.7;
  shape-rendering: crispEdges;
}

.grid path {
  stroke-width: 0;
}
</style>
