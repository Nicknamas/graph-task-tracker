<template>
  <svg :class="$style.icon" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg"><polygon points="6 3 20 12 6 21 6 3" style="transform: none; transform-origin: 50% 50%; transform-box: fill-box;"></polygon></svg>
</template>

<style module>
.icon {
  width: 48px;
  height: 48px;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: 0.1s;

  &:hover {
    background-color: var(--accent-color-dark);
  }

  polygon {
    stroke: var(--icon-color);
  }
}
</style>
