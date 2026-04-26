<template>
  <svg :class="$style.icon" fill="none" height="28" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg"><rect height="8" rx="2" width="20" x="2" y="14"></rect><path d="M6 18h.01"></path><path d="M10 18h.01"></path><g style="transform: none; transform-origin: 50% 50%; transform-box: fill-box;"><path d="m16 6-4-4-4 4"></path><path d="M12 2v8"></path></g></svg>
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

