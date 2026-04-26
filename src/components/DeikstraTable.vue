<script setup lang="ts">
import { solveTask8_Dijkstra, type WeightedAdjacencyList } from '@/scripts/tasks';
import { computed } from 'vue';

interface Props {
  selectedId: number
  values: WeightedAdjacencyList
}

const { values, selectedId } = defineProps<Props>()

const result = computed(() => solveTask8_Dijkstra(values, selectedId))
</script>

<template>
  <div :class="$style.tableContainer">
    <div :class="$style.header">
      <p :class="$style.title">
        Выбранный id: {{ selectedId }}
      </p>
    </div>
    <table :class="$style.table" >
      <thead>
        <tr>
          <th
            v-for="(_, index) of result"
            :key="index"
          >
            {{ index }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            v-for="(value, indexY) of result"
            :key="indexY"
          >
            <input
              v-if="!value"
              :class="$style.input"
              readonly
              value="-"
            >
            <input
              v-else
              :class="$style.input"
              readonly
              :value="value"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style module>
.tableContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .title {
    font-size: 20px;
    color: var(--text-color);
  }
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--table-border-color);
}

.buttons {
  display: flex;
  align-items: center;
  gap: 8px;

  .button {
    width: 32px;
    height: 32px;
    padding: 8px;
    border-radius: 8px;
    transition: 0.1s;
    cursor: pointer;

    &:hover {
      background-color: var(--accent-color-dark);
    }
  }
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input {
  text-align: center;
  width: 32px;
  transition: 0.2s;
  height: 100%;
  border: none;
}

.table {
  border-collapse: collapse;
  height: fit-content;
  width: fit-content;

  th, td {
    text-align: center;
    color: var(--text-color);
  }

  tbody tr:first-child td {
    border-top: 1px solid var(--table-border-color);

    input {
      border-start-start-radius: 0;
      border-start-end-radius: 0;
    }
  }

  tbody tr:last-child td {
    border-bottom: 1px solid var(--table-border-color);

    input {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
    }
  }

  tbody tr td:first-of-type {
    border-left: 1px solid var(--table-border-color);

    input {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
  }

  tbody tr td:last-of-type {
    border-right: 1px solid var(--table-border-color);

    input {
      border-end-end-radius: 0;
      border-start-end-radius: 0;
    }
  }

  th {
    width: 32px;
    height: 32px;
    font-size: 16px;
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

  td:has(input:not(:disabled)):hover {
    input {
      background-color: var(--table-value-hover);
      color: white;
    }
    input::placeholder {
      color: white;
    }
  }
}

.slot {
  margin-top: 12px;
}
</style>
