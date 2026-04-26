import { type MaybeRefOrGetter, onMounted, onUnmounted, type Ref, toValue, unref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

export function useSSEInvalidation(
  url: MaybeRefOrGetter<string>,
  queryKeysToInvalidate: Ref<string[][]> | string[][]
) {
  const queryClient = useQueryClient();
  let eventSource: EventSource | null = null;

  onMounted(() => {
    const resolvedUrl = toValue(url);
    const keysToInvalidate = toValue(queryKeysToInvalidate);
    if (!resolvedUrl) return;

    eventSource = new EventSource(resolvedUrl);

    eventSource.onmessage = (event) => {
      keysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource?.close();
    };
  });

  onUnmounted(() => {
    eventSource?.close();
  });
}
