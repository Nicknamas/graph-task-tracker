<script setup lang="ts">
import 'vue3-toastify/dist/index.css';
import { client } from './generated/api/client.gen';
import { useSetToken } from './scripts/tasks';

const { setToken } = useSetToken()

client.setConfig({ baseUrl: import.meta.env.VITE_API })

setToken()
</script>

<template>
  <RouterView />
</template>

<style>
@import url('./styles/variables.css');
@import url('./styles/reset.css');

#app, .wrapper {
  height: 100%;
}
</style>
