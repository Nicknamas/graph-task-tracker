<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrl, getSvgIcon, loadIcons } from './model'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: 'auto',
  },
})

const width = computed(() => {
  return props.size ? `${props.size}px` : `${props.width}px`
})
const height = computed(() => {
  return props.size ? `${props.size}px` : `${props.height}px`
})

loadIcons()
</script>

<template>
  <span
    v-if="getSvgIcon(props.name)"
    class="icon"
    :style="{
      width,
      height,
    }"
    v-html="getSvgIcon(props.name)"
  />
  <img
    v-else
    :src="getImageUrl(props.name)"
    :style="{
      width,
      height,
    }"
  />
</template>

<style scoped>
.icon {
  display: flex;
}

.icon {
  width: inherit;
  height: inherit;
}
</style>
