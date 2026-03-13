<script lang="ts" setup>
import * as d3 from "d3";
import { computed, onMounted, ref } from "vue";
import type { Data, Link, Node } from "@shared/index";

function render() {
  d3.select("#svg").selectAll("g").remove()

  const width = 928;
  const height = 600;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links = data.value.links.map(d => ({...d}));
  const nodes = data.value.nodes.map(d => ({...d}));

  // Create a simulation with several forces.
  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

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
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("g")

  nodeGroup.append("text").text((d) => d.id)

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

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
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

const values = ref<[[number, number], [number, number]]>([
  [0, 0],
  [0, 0],
])

const sum = computed(() => {
  let _sum = 0

  for (let i = 0; i < values.value.length; i++) {
    const row = values.value[i]!
    for (let j = 0; j < row.length; j++) {
      const value = row[j]!

      _sum += value
    }
  }

  return _sum
})

function compute() {
  render()
}

const data = computed<Data>(() => {
  const object: Data = {
    nodes: [],
    links: []
  }

  for (let i = 0; i < values.value.length; i++) {
    const row = values.value[i]!
    for (let j = 0; j < row.length; j++) {
      const value = row[j]!

      const node : Node = {
        group: 1,
        id: `${i}${j}`
      }

      object.nodes.push(node)

      if (!value) {
        continue
      }

      const link: Link = {
        value: 1,
        source: `${i}${j}`,
        target: `${j}${i}`,
      }

      object.links.push(link)
    }
  }

  console.log(object)

  return object
})

onMounted(() => {
  render()
})
</script>

<template>
  <div>
    <svg id="svg"></svg>
  </div>

  <button id="button">Обход</button>
  <button @click="compute">Test</button>
  {{ values }}
  {{ data }}
  {{ sum }}
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>A</th>
        <th>B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>A</th>
        <td>
          <input v-model.number="values[0][0]" placeholder="0" />
        </td>
        <td>
          <input v-model.number="values[0][1]" placeholder="0" />
        </td>
      </tr>
      <tr>
        <th>B</th>
        <td>
          <input v-model.number="values[1][0]" placeholder="0" />
        </td>
        <td>
          <input v-model.number="values[1][1]" placeholder="0" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

