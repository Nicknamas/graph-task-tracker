<script setup lang="ts">
import { ref } from 'vue';
import GraphCreateModal from './GraphCreateModal.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { getGetPaginatedGraph } from '@/generated/api';
import { RouterLink } from 'vue-router';
import { deleteByGraphIdMutation } from '@/generated/api/@tanstack/vue-query.gen';

const isShowCreateGraph = ref<boolean>(false)
const searchQuery = ref<string>('')

const { mutate: deleteGraph } = useMutation({
  ...deleteByGraphIdMutation(),
})

function handleDeleteGraph(graphId: string | undefined): void {
  if (!graphId) return
  deleteGraph({ path: { graphId } })
}

const { data: list } = useQuery({
  queryKey: ['graphs', searchQuery],
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
        v-model="searchQuery"
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
          <div>
            <div
              :class="$style.delete"
              @click="handleDeleteGraph(item.id)"
            >
              X

            </div>
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

.itemName, .itemDescription {
  color: var(--text-color);
}

.item {
  position: relative;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);

  .delete {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

.input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

</style>
