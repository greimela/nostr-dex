<script setup lang="ts">
const route = useRoute();
</script>
<template>
  <div>
    <div class="grid gap-8">
      <OfferView :filter="{ '#a': [route.params.asset] }" />
    </div>
  </div>
</template>
