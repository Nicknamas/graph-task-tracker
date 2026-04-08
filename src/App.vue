<script lang="ts" setup>
import * as d3 from "d3";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import type { Data, Link, Node } from "@shared/index";

const width = ref(420)
const isDragging = ref(false)
const isLoadingMode = ref<boolean>(false)
const selectedId = ref(0)
const zoomValue = ref()
const svgRef = useTemplateRef('svg')

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

function wrap(textString, textSelection, width, xPos, yPos) {
    textSelection.text(null);
    const words = textString.split(/\s+/);
    let line = [];
    let tspan = textSelection.append("tspan").attr("x", xPos).attr("y", yPos);

    words.forEach(word => {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = textSelection.append("tspan")
                .attr("x", xPos)
                .attr("dy", "1.1em")
                .text(word);
        }
    });
}

function render() {
  const width = 500
  const height = 500
  const rectWidth = 200;
  const rectHeight = 60;
  const fontSize = "12px";

  const distance = 2;
  const strength = -1000;

  const links = data.value.links.map(d => ({ ...d }))
  const nodes = data.value.nodes.map(d => ({ ...d }))

  const svg = d3.select(svgRef.value)
      .attr("width", "100%")
      .attr("height", "100%")

  svg.selectAll("*").remove();

  const mainGroup = svg.append("g")
  mainGroup.attr("transform", zoomValue.value);

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
      .attr("marker-end", "url(#arrowhead)");

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

    console.log(el)

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

      if (selectedId.value === id) {
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
      console.log(id)
      const el = d3.select(`[data-id="${id}"]`)
      el.attr('fill', 'orange')
    }
  })

  d3.select('#button').on("click", () => {
    const walkedIds = new Set()

    let counter = 0

    let currentId = String(selectedId.value)
    const way: string[] = []

    while (currentId !== null) {
      way.push(currentId)

      if (!graph.value[currentId]) {
        break
      }

      currentId = graph.value[currentId][0]
    }

    function walkGraph(id: string | number) {
      if (walkedIds.has(id)) {
        return
      }

      counter++

      walkedIds.add(id)

      const el = d3.select(`[data-id="${id}"]`)
      const t = d3.transition().duration(500 * counter * 2)
      el.transition(t).attr('fill', 'black')
      if (graph.value[id] === null) {
        return
      }
      walkGraph(graph.value[id][0])
    }

    isLoadingMode.value = true
    walkGraph(selectedId.value)
    setTimeout(() => {
      isLoadingMode.value = false
    }, 500 * counter * 2)
  })
}

const graph = computed(() => {
  const object = {}

  for (const node of data.value.nodes) {
    object[node.id] = null
  }

  for (const link of data.value.links) {
    if (object[link.source] === null) {
      object[link.source] = [link.target]
      continue
    }

    object[link.source].push(link.target)
  }

  return object
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
        value: 1,
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

function handleStartDrag(e): void {
  width.value = width.value - e.offsetX - 11
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
      <div :class="$style.aside + ' ' + $style.aside_padding">
        <div :class="$style.list">
          <button :disabled="isLoadingMode" id="button">Обход</button>
          <button :disabled="isLoadingMode" id="reset">Сбросить обход</button>
          <button @click="addNode">Добавить узел</button>
          <button @click="deleteNode">Удалить узел</button>
        </div>
      </div>
      <div :class="$style.view">
        <svg ref="svg"></svg>
      </div>
      <div :class="$style.aside + ' ' + $style.row + ' ' + $style.aside_right" :style="{ width: width + 'px' }">
        <div
          :class="$style.lineResize"
        />
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
      </div>
    </div>
    {{ graph }}
  </div>
</template>

<style module>
@import url('./styles/reset.css');

.content {
  display: grid;
  grid-template-columns: 0.5fr 2fr auto;
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
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  background-color: orange;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  transition: 0.2s;
  cursor: pointer;

  font-size: 20px;

  &:hover {
    background-color: darkorange;
  }

  &:disabled {
    background-color: grey;
    cursor: progress;
  }
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

.input {
  text-align: center;
  width: 32px;
  transition: 0.2s;
  height: 100%;
  border: none;
}
</style>

<style>
#app, .wrapper {
  height: 100%;
}
</style>
