<script setup lang="ts">
import { ref, watch } from 'vue'
import MinusIcon from './MinusIcon.vue'
import PlusIcon from './PlusIcon.vue'
import type { Modes } from '@/shared'

interface Props {
  activeMode: Modes
}

const { activeMode } = defineProps<Props>()

const values = defineModel<(number | undefined)[][]>({ required: true })

const isOrient = ref<boolean>(false)

function addNode(): void {
  if (!values.value || !values.value[0]) {
    values.value = [[undefined]]
    return
  }

  const lengthRow = values.value[0].length

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
  if (!values.value) return

  for (const row of values.value) {
    row.pop()
  }

  values.value.pop()
}

function handleInput(event: InputEvent, x: number, y: number) {
  if (!values.value) return

  const row = values.value[y]

  if (!row) return

  if (isOrient.value) {
    row[x] = Number((event.target as HTMLInputElement).value)
  }
}

watch(() => activeMode, () => {
  if (activeMode === 'prufer' || activeMode === 'mst') {
    isOrient.value = true

    for (let i = 0; i < values.value.length; i++) {
      const row = values.value[i]

      if (!row) continue

      for (let j = i; j < row.length; j++) {
        const row1 = values.value[i]
        const row2 = values.value[j]

        if (!row1 || !row2) continue

        const value = row1[j]
        row2[i] = value
      }
    }
  }
})
</script>

<template>
  <div :class="$style.tableContainer">
    <div :class="$style.header">
      <p :class="$style.title">
        Adjacency Matrix
      </p>
      <div :class="$style.buttons">
        <button
          :class="$style.button"
          @click="addNode"
        >
          <PlusIcon />
        </button>
        <button
          :class="$style.button"
          @click="deleteNode"
        >
          <MinusIcon />
        </button>
      </div>
      <label for="is-orient">
        <p :class="$style.text">
          isNeOrient:
        </p>
        <input
          v-model="isOrient"
          type="checkbox"
          id="is-orient"
        >
      </label>
    </div>
    <table :class="$style.table" >
      <thead>
        <tr>
          <th></th>
          <th
            v-for="(_, index) of values"
            :key="index"
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
          <th>
            {{ indexY }}
          </th>
          <td
            v-for="(_, indexX) in row.length"
            :key="indexX"
          >
            <input
              v-if="indexX === indexY"
              :class="$style.input"
              readonly
              disabled
              value="-"
            >
            <input
              v-else
              v-model.number="row[indexX]"
              @input="handleInput($event, indexY, indexX)"
              :class="$style.input"
              placeholder="0"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div :class="$style.divider" />
    <div :class="$style.slot">
      <slot />
    </div>
  </div>
</template>

<style module>
.tableContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--table-color);
  border: 1px solid var(--table-border-color);
  padding: 20px;
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

.text {
  color: var(--text-color);
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
