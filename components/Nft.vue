<script setup>
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';

const { nft } = defineProps({
  nft: Object,
});
QuestionMarkCircleIcon;
</script>
<template>
  <NuxtLink target="_blank" :to="`https://mintgarden.io/nfts/${nft.id}`">
    <img v-if="nft.thumbnail_uri" class="mx-auto h-48 w-48 object-cover rounded-lg" :src="nft.thumbnail_uri" />
    <div v-else class="mx-auto h-48 w-48 flex items-center justify-center border border-gray-300 rounded-lg">
      <QuestionMarkCircleIcon class="h-1/2 w-1/2 text-gray-400" />
    </div>
    {{ nft.name }}
  </NuxtLink>
</template>
