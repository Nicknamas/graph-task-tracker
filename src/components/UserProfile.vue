<script setup lang="ts">
import { getUserMe } from '@/generated/api';
import { useQuery } from '@tanstack/vue-query';

const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: async () => {
    const { data } = await getUserMe()
    return data
  },
  staleTime: 5 * 60 * 1000,
})
</script>

<template>
  <div :class="$style.userProfile">
    <div :class="$style.avatar">
      <p :class="$style.userFirstLetterOfName">
        {{ user?.username[0] }}
      </p>
    </div>
    <div :class="$style.block">
      <p :class="$style.username">{{ user?.username }}</p>
    </div>
  </div>
</template>

<style module>
.userProfile {
  k
}
</style>
