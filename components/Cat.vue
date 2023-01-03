<script setup>
import { BigNumber, util } from 'greenwebjs';

const { amount, cat } = defineProps({
  amount: [BigNumber, Number],
  cat: Object,
});
</script>
<template>
  <NuxtLink target="_blank" :to="`https://www.taildatabase.com/tail/${cat.tailHash}`" class="inline-flex gap-1">
    <img class="h-6 w-6" :src="`https://icons.dexie.space/${cat.tailHash}.webp`" />{{ util.formatToken(amount) }}
    {{ cat.symbol }}
  </NuxtLink>
</template>
