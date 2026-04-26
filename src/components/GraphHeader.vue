<script setup lang="ts">
import PlayIcon from './PlayIcon.vue';
import RestartIcon from './RestartIcon.vue';

interface Props {
  isHidedRestart: boolean
  isHidedCheckMode: boolean
  showButtons: boolean
}

interface Emits {
  start: []
  restart: []
}

defineProps<Props>()
defineEmits<Emits>()

const isCheckMode = defineModel<boolean>()
</script>

<template>
  <div :class="$style.header">
    <template
      v-if="showButtons"
    >
      <PlayIcon
        @click="$emit('start')"
      />
      <RestartIcon
        v-if="!isHidedRestart"
        @click="$emit('restart')"
      />
      <label
        for="check-mode"
        v-if="!isHidedCheckMode"
      >
        Check mode:
        <input
          v-model="isCheckMode"
          id="check-mode"
          type="checkbox"
        />
      </label>
    </template>
  </div>
</template>

<style module>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--header-color);
  border-bottom: 1px solid var(--header-border-color);
  padding: 8px 12px;
}
</style>
