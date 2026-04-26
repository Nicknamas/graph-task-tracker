<script setup lang="ts">
import { solveTask9_FloydWarshall, type WeightedAdjacencyList } from '@/scripts/tasks';
import { computed } from 'vue';

interface Props {
  values: WeightedAdjacencyList
}

const { values } = defineProps<Props>()

const result = computed(() => solveTask9_FloydWarshall(values))
</script>

<template>
  <div :class="$style.tableContainer">
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
        <tr
          v-for="(row, indexY) of result"
          :key="indexY"
        >
          <td
            v-for="(value, indexX) of row"
            :key="indexX"
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
              :value="value === Infinity ? '-' : value"
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

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input {
  text-align: center;
  width: 32px;
  height: 32px;
  transition: 0.2s;
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
}

.slot {
  margin-top: 12px;
}
</style>
