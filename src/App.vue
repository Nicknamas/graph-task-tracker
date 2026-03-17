<script lang="ts" setup>
import * as d3 from "d3";
import { computed, onMounted, ref, watch } from "vue";
import type { Data, Link, Node } from "@shared/index";

function render() {
  d3.select("#svg").selectAll("g").remove()

  const width = 928;
  const height = 600;
  const distance = 200;
  const strength = -5000;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links = data.value.links.map(d => ({...d}));
  const nodes = data.value.nodes.map(d => ({...d}));


  // Create a simulation with several forces.
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

  // Create the SVG container.
  const svg = d3.select("#svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Add a line for each link, and a circle for each node.
  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

  const nodeGroup = svg.append("g")
      .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("g")

  nodeGroup.append("rect")
      .attr("width", 100)
      .attr("height", 100)
      .attr("x", -100 / 2)
      .attr("y", -100 / 2)
      .attr("rx", 8)
      .attr("fill", "blue")

  const nodeText = nodeGroup.append("text").text((d) => d.id)

  const node = nodeGroup
      .append("circle")
      .attr("r", 5)
      .attr("fill", d => color(d.group))

  node.append("title")
      .text(d => d.id);


  // Add a drag behavior.
  node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  d3.select('#button').on("click", () => {
    svg.selectAll("circle").each(function (d) {
      const circle = d3.select(this)
      const index = d.index

      const t = d3.transition()
        .duration(250 * index * 2)

      circle.transition(t).style('fill', 'black').attr('r', '7')
    })
  })
}

const values = ref<(number | undefined)[][]>([[undefined]])

const data = computed<Data>(() => {
  const object: Data = {
    nodes: [],
    links: []
  }

  const existingIds: string[] = []

  for (let i = 0; i < values.value.length; i++) {
    const row = values.value[i]!
    for (let j = 0; j < row.length; j++) {
      const value = row[j]!

      const id = String(i)

      if (existingIds.includes(id)) {
        continue
      }

      const node : Node = {
        group: 1,
        id
      }

      object.nodes.push(node)
      existingIds.push(id)

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

function addNode(): void {
  const newRow = []

  for (const row of values.value) {
    row.push(undefined)
  }

  const lengthRow = values.value[0]?.length

  if (!lengthRow) return

  for (let i = 0; i < lengthRow; i++) {
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
      <div :class="$style.aside">
        <div :class="$style.list">
          <button id="button">Обход</button>
          <button @click="addNode">add new node</button>
          <button @click="deleteNode">delete node</button>
        </div>
      </div>
      <div :class="$style.view">
        <svg id="svg"></svg>
      </div>
      <table :class="$style.table">
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
</template>

<style module>
@import url('./styles/reset.css');


.content {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 1fr;
  gap: 40px;
  height: 100%;
}

.aside {
  padding: 20px;
  background-color: darkorange;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  background-color: orange;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  transition: 0.2s;
  cursor: pointer;

  font-size: 20px;

  &:hover {
    background-color: darkorange;
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
