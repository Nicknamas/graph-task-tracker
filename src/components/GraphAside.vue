<script setup lang="ts">
import type { Modes } from '@/shared';
import Icon from '@icons/index'

const activeMode = defineModel<Modes>({ required: true })
</script>

<template>
  <div :class="$style.aside">
    <h2 :class="$style.title">GUTT</h2>
    <div :class="$style.buttons">
      <button
        @click="activeMode = 'complex'"
        :class="$style.button"
        :data-active="activeMode === 'complex'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          Complex Analyze
        </p>
      </button>
      <button
        @click="activeMode = 'dfs'"
        :class="$style.button"
        :data-active="activeMode === 'dfs'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          DFS
        </p>
      </button>
      <button
        @click="activeMode = 'bfs'"
        :class="$style.button"
        :data-active="activeMode === 'bfs'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          BFS
        </p>
      </button>
      <button
        @click="activeMode = 'connected-components'"
        :class="$style.button"
        :data-active="activeMode === 'connected-components'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          Connected Components
        </p>
      </button>
      <button
        @click="activeMode = 'prufer'"
        :class="$style.button"
        :data-active="activeMode === 'prufer'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          Prufer
        </p>
      </button>
      <button
        @click="activeMode = 'deikstra'"
        :class="$style.button"
        :data-active="activeMode === 'deikstra'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          Deikstra
        </p>
      </button>
      <button
        @click="activeMode = 'floyed'"
        :class="$style.button"
        :data-active="activeMode === 'floyed'"
      >
        <Icon name="dfs" />
        <p :class="$style.text">
          Floyed
        </p>
      </button>
    </div>
  </div>
</template>

<style module>
.aside {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--sidebar-color);
  border: 1px solid var(--sidebar-border);
  height: 100%;
  padding: 20px;

  .title {
    color: var(--text-color);
    font-size: 32px;
    font-weight: bold;
  }

  .buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--sidebar-border);
      transition: 0.1s;
      cursor: pointer;

      &[data-active="true"] {
        background-color: var(--sidebar-color-hover);
        border-color: var(--sidebar-border-color-hover);
      }

      &:hover {
        background-color: var(--sidebar-color-hover);
        border-color: var(--sidebar-border-color-hover);
      }

      .text {
        color: var(--text-color);
        transition: 0.1s;
        font-size: 12px;
      }
    }
  }
}
</style>
