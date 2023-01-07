<script setup lang="ts">
import { ref } from 'vue';
import { useRelay } from '~/composables/useRelay';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'


const NOSTR_OFFER_TYPE = 8444;

const relay = await useRelay();

const events = ref<any[]>([]);

relay.subscribeToEvents(
  {
    kinds: [NOSTR_OFFER_TYPE],
    limit: 10,
    // '#a': ['6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'],
    // '#a': ['6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'],
    // '#c': ['col1z0ef7w5n4vq9qkue67y8jnwumd9799sm50t8fyle73c70ly4z0ws0p2rhl'],
    // authors: ['214fa97d9d406ba5e447035c312c2ee5ecf4fde91cde359917472ea9193d76b7']
  },
  async (event: any) => events.value.push(event)
);

const route = useRoute();
const router = useRouter();
const onlyShowActiveOffers = ref(route.query.active ? route.query.active === 'true' : true);
const showNftOffers = ref(route.query.nft ? route.query.nft === 'true' : true);
watch([onlyShowActiveOffers, showNftOffers], ([active, nft]) => {
  router.replace({
    path: route.path,
    query: { active: String(active), nft: String(nft) },
  });
});

const sortedEvents = computed(() =>
  events.value
    .filter((event) => (onlyShowActiveOffers.value ? event.status === 'active' : true))
    .filter((event) => {
      return showNftOffers.value ? true : !event.containsNft;
    })
    .sort((a, b) => b.created_at - a.created_at)
);
</script>
<template>
  <div>
    <div class="mt-8 flex justify-center">
      <div class="inline-flex flex-col gap-3">
        <SwitchGroup as="div" class="flex items-center">
          <Switch
            v-model="onlyShowActiveOffers"
            :class="[
              onlyShowActiveOffers ? 'bg-emerald-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            ]"
          >
            <span
              aria-hidden="true"
              :class="[
                onlyShowActiveOffers ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]"
            />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Only show active offers</span>
          </SwitchLabel>
        </SwitchGroup>
        <SwitchGroup as="div" class="flex items-center">
          <Switch
            v-model="showNftOffers"
            :class="[
              showNftOffers ? 'bg-emerald-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            ]"
          >
            <span
              aria-hidden="true"
              :class="[
                showNftOffers ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              ]"
            />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Show NFT offers</span>
          </SwitchLabel>
        </SwitchGroup>
      </div>
    </div>
    <div class="mt-8 grid gap-8">
      <div v-for="event in sortedEvents" :key="event.id">
        <OfferCard :event="event" />
      </div>
    </div>
  </div>
</template>