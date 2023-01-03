<script setup>
import { util } from 'greenwebjs';

const { event } = defineProps({
  event: Object,
});
</script>
<template>
  <div class="overflow-hidden rounded-lg bg-white shadow">
    <div class="grid grid-cols-2 divide-x border-b font-semibold text-gray-700 text-center">
      <div class="p-6 pt-4 h-full">
        <div class='pb-4 text-gray-400 text-xs'>Requested</div>
        <div v-for="requestedPayment in event.requestedPayments">
          <Nft v-if="requestedPayment.nft" :nft="requestedPayment.nft" />
          <Cat v-else-if="requestedPayment.cat" :amount="requestedPayment.amount" :cat="requestedPayment.cat" />
          <div v-else class="inline-flex gap-1">
            <img class="h-6 w-6" src="https://icons.dexie.space/xch.webp" />{{
              util.formatChia(requestedPayment.amount)
            }}
            XCH
          </div>
        </div>
      </div>
      <div class="p-6 pt-4 h-full">
        <div class='pb-4 text-gray-400 text-xs'>Offered</div>
        <div v-for="offeredCoin in event.offeredCoins">
          <Nft v-if="offeredCoin.nft" :nft="offeredCoin.nft" />
          <Cat v-else-if="offeredCoin.cat" :amount="offeredCoin.amount" :cat="offeredCoin.cat" />
          <div v-else class="inline-flex gap-1">
            <img class="h-6 w-6" src="https://icons.dexie.space/xch.webp" />{{ util.formatChia(offeredCoin.amount) }}
            XCH
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 flex justify-center" v-if="event.status === 'active'">
      <TakeOfferButton :offer="{ offer: event.content }" />
    </div>
  </div>
</template>
