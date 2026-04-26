<script setup lang="ts">
import { ref } from 'vue';
import GraphCreateModal from './GraphCreateModal.vue';
import { useQuery } from '@tanstack/vue-query';
import { getGetPaginatedGraph } from '@/generated/api';
import { RouterLink } from 'vue-router';

const isShowCreateGraph = ref<boolean>(false)
const searchQuery = ref<string>('')

const { data: list } = useQuery({
  queryKey: ['graphs'],
  queryFn: async () => {
    const { data } = await getGetPaginatedGraph({
      query: {
        KeyWordForSearch: searchQuery.value,
        PageNumber: 1,
        PageSize: 10,
      }
    })
    return data
  },
  staleTime: 5 * 60 * 1000,
})
</script>

<template>
  <div :class="$style.graphs">
    <div :class="$style.header">
      <p :class="$style.logo">
        GUTT
      </p>
    </div>
    <div :class="$style.divider" />
    <div :class="$style.content">
      <button
        :class="$style.button"
        @click="isShowCreateGraph = true"
      >
        Создать граф
      </button>
      <input
        :class="$style.input"
        placeholder="Поиск графов"
        type="text"
      />
      <div
        :class="$style.list"
      >
        <RouterLink
          v-for="item of list"
          :key="item.id"
          :class="$style.item"
          :to="{ name: 'GraphPage', params: { graphId: item.id } }"
        >
          <div
          >
            <p :class="$style.itemName">
              {{ item.name }}
            </p>
            <p :class="$style.itemName">
              {{ item.description }}
            </p>
          </div>
        </RouterLink>
      </div>
      <GraphCreateModal
        v-model="isShowCreateGraph"
        @close="isShowCreateGraph = false"
      />
    </div>
  </div>
</template>

<style module>
.graphs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.header {
  width: 100%;
  padding: 12px 16px;
}

.button {
  padding: 8px 12px;
  background-color: var(--button-color);
  color: var(--button-text-color);
  border-radius: 8px;
  cursor: pointer;
  transition: 0.1s;
  max-width: 120px;

  &:hover {
    background-color: var(--button-color-hover);
  }
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--accent-color);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.item {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
}
</style>
