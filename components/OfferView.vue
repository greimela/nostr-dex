<script setup lang="ts">
import { useRelay } from '~/composables/useRelay';
import { ref } from 'vue';
import { Sub } from 'nostr-tools';

const props = defineProps({
  filter: { type: Object, default: {} },
  onlyShowActiveOffers: { default: true },
});
const { filter, onlyShowActiveOffers } = toRefs(props);

const relay = await useRelay();

const events = ref<any[]>([]);
let sub: Sub | undefined = undefined;
watch(
  relay.isConnected,
  (isConnected, wasConnected) => {
    console.log({ isConnected, wasConnected });
    if (isConnected && !wasConnected) {
      if (sub) {
        sub.unsub();
      }
      sub = relay.subscribeToEvents(
        {
          kinds: [NOSTR_OFFER_TYPE],
          limit: 10,
          since: events.value.length > 0 ? events.value[events.value.length].created_at : undefined,
          ...filter.value,
        },
        async (event: any) => events.value.push(event)
      );
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (sub) {
    sub.unsub();
  }
});

const sortedEvents = computed(() =>
  events.value
    .filter((event) => (onlyShowActiveOffers.value ? event.status === 'active' : true))
    // .filter((event) => {
    //   return showNftOffers.value ? true : !event.containsNft;
    // })
    .sort((a, b) => b.created_at - a.created_at)
);
</script>
<template>
  <div class="mt-8 grid gap-8">
    <div v-for="event in sortedEvents" :key="event.id">
      <OfferCard :event="event" />
    </div>
  </div>
</template>