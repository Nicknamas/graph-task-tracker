<template>
  <svg :class="$style.icon" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg" style="transform: none;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
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

  path {
    stroke: var(--icon-color);
  }
}
</style>

