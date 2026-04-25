<script setup lang="ts">
import ZoomInIcon from './ZoomInIcon.vue';
import ZoomOutIcon from './ZoomOutIcon.vue';
import ZoomReset from './ZoomReset.vue';
</script>

<template>
  <div :class="$style.zoomPanel">
    <div id="zoom-in" :class="$style.item">
      <ZoomInIcon />
    </div>
    <div :class="$style.divider" />
    <div id="zoom-reset" :class="$style.item">
      <ZoomReset />
    </div>
    <div :class="$style.divider" />
    <div id="zoom-out" :class="$style.item">
      <ZoomOutIcon />
    </div>
  </div>
</template>

<style module>
.zoomPanel {
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background-color: white;
  border-radius: 12px;
}

.divider {
  width: 100%;
  min-height: 1px;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: 0.2s;
  cursor: pointer;

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
