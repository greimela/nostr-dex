<script setup lang="ts">
import { useRelay } from '~/composables/useRelay';
import { ref } from 'vue';

const props = defineProps({
  filter: { type: Object, default: {} },
  onlyShowActiveOffers: { default: true },
});
const { filter, onlyShowActiveOffers } = toRefs(props);

const relay = await useRelay();

const events = ref<any[]>([]);

const sub = relay.subscribeToEvents(
  {
    kinds: [NOSTR_OFFER_TYPE],
    limit: 10,
    ...filter.value,
  },
  async (event: any) => events.value.push(event)
);
onBeforeUnmount(() => {
  console.log('unsub');
  sub.unsub();
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