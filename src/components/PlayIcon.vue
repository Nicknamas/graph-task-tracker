<template>
  <svg :class="$style.icon" width="100%" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.125 8.89453C22.3765 10.0736 22.3765 13.2955 20.125 14.4746L5.46094 22.1543C3.36372
      23.2524 0.849838 21.7315 0.849609 19.3643L0.849609 4.00488C0.849835 1.6376 3.36372 0.116775
      5.46094 1.21484L20.125 8.89453Z" stroke-width="2.2"/>
  </svg>
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
