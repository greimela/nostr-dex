<script setup>
const { nft } = defineProps({
  nft: Object,
});
</script>
<template>
  <NuxtLink target="_blank" :to="`https://mintgarden.io/nfts/${nft.id}`">
    <img class="h-48 w-48 object-cover" :src="nft.thumbnail_uri" />
    {{ nft.name }}
  </NuxtLink>
</template>
