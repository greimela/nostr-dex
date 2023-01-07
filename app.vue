<script setup lang="ts">
import { Buffer } from 'buffer';
import { generatePrivateKey, getEventHash, getPublicKey, signEvent } from 'nostr-tools';
import { ref } from 'vue';
import { Offer } from '~/chia/offer';

window.Buffer = Buffer;

const { isConnected } = await useRelay();

let sk = generatePrivateKey();
let pk = getPublicKey(sk);

const newOfferString = ref('');
const postOffer = async () => {
  try {
    // Try to parse offer
    Offer.from_bech32(newOfferString.value);

    let offerEvent: any = {
      kind: NOSTR_OFFER_TYPE,
      pubkey: pk,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: newOfferString.value,
    };
    offerEvent.id = getEventHash(offerEvent);
    offerEvent.sig = signEvent(offerEvent, sk);

    let pub = relay.publish(offerEvent);
    pub.on('ok', () => {
      console.log(`${relay.url} has accepted our event`);
      newOfferString.value = '';
    });
    pub.on('seen', () => {
      console.log(`we saw the event on ${relay.url}`);
    });
    pub.on('failed', (reason: any) => {
      console.log(`failed to publish to ${relay.url}: ${reason}`);
    });
  } catch (e) {
    alert(e);
  }
};
</script>
<template>
  <div>
    <div class="bg-slate-50 px-4 pt-16 pb-20 sm:px-6">
      <div class="relative mx-auto max-w-lg">
        <h1 class="text-6xl font-medium text-center">nostr-dex</h1>
        <p class="mt-4 text-center text-gray-400">
          An experimental trustless decentralized exchange using the nostr protocol and Chia offers.
        </p>
        <div class="mt-4 flex justify-center">
          <div v-if="isConnected" class="flex items-center gap-2 text-sm text-gray-700 font-semibold text-emerald-600">
            <div class="relative inline-flex">
              <span class="flex h-3 w-3">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
            </div>
            Socket connected
          </div>
          <div v-else class="flex items-center gap-2 text-sm text-gray-700 font-semibold text-gray-600">
            <div class="relative inline-flex">
              <span class="flex h-3 w-3">
                <span class="relative inline-flex rounded-full h-3 w-3 bg-gray-600"></span>
              </span>
            </div>
            Socket disconnected
          </div>
        </div>
        <form action="#" @submit.prevent="postOffer" class="mt-4 relative bg-white">
          <div
            class="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
          >
            <label for="comment" class="sr-only">Add your offer</label>
            <textarea
              v-model="newOfferString"
              rows="3"
              name="offer"
              id="offer"
              class="block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm"
              placeholder="Add your offer..."
            />

            <!-- Spacer element to match the height of the toolbar -->
            <div class="py-2" aria-hidden="true">
              <!-- Matches height of button in toolbar (1px border + 36px content height) -->
              <div class="py-px">
                <div class="h-9" />
              </div>
            </div>
          </div>

          <div class="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <div class="flex items-center space-x-5"></div>
            <div class="flex-shrink-0">
              <button
                type="submit"
                class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
        <div class="mt-8">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>
