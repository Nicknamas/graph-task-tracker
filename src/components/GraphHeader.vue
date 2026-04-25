<script setup lang="ts">
import PlayIcon from './PlayIcon.vue';


</script>

<template>
  <div :class="$style.header">
    <PlayIcon @click="$emit('start')" />
  </div>
</template>

<style module>

.header {
  background-color: var(--header-color);
  border-bottom: 1px solid var(--header-border-color);
  padding: 8px 12px;
}
</style>
