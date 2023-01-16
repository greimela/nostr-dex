<script setup lang="ts">
import { Buffer } from 'buffer';
import { generatePrivateKey, getEventHash, getPublicKey, signEvent } from 'nostr-tools';
import { ref } from 'vue';
import { Offer } from '~/chia/offer';

window.Buffer = Buffer;

const { isConnected, publish } = await useRelay();

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

    await publish(offerEvent);
    newOfferString.value = '';
  } catch (e) {
    alert(e);
  }
};

const tabs = [
  {
    to: '/',
    name: 'All Markets',
  },
  {
    to: '/type/cat',
    name: 'All CATs',
  },
  {
    to: '/type/nft',
    name: 'All NFTs',
  },
  {
    to: '/asset/6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589',
    name: 'USDS',
  },
  {
    to: '/asset/db1a9020d48d9d4ad22631b66ab4b9ebd3637ef7758ad38881348c5d24c38f20',
    name: 'DBX',
  },
];
</script>
<template>
  <div>
    <div class="min-h-screen bg-slate-50 px-4 pt-16 pb-20 sm:px-6">
      <div class="relative mx-auto max-w-lg">
        <h1 class="text-6xl font-medium text-center">nostr-dex</h1>
        <p class="mt-4 text-center text-gray-400">
          An experimental trustless decentralized exchange using the
          <a href="https://github.com/nostr-protocol/nostr" target="_blank" class="font-semibold text-gray-500"
            >nostr protocol</a
          >
          and
          <a href="https://chialisp.com/offers/" target="_blank" class="font-semibold text-gray-500">Chia offers</a>.
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
          <div class="border-b border-gray-200 pb-5 sm:pb-0">
            <div>
              <nav class="-mb-px flex space-x-8 flex-wrap">
                <NuxtLink
                  v-for="tab in tabs"
                  :key="tab.name"
                  :to="tab.to"
                  active-class="!border-emerald-500 !text-emerald-600"
                  class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                  >{{ tab.name }}
                </NuxtLink>
              </nav>
            </div>
          </div>
          <NuxtPage />
        </div>
      </div>
    </div>
    <NuxtLink to="https://github.com/greimela/nostr-dex"  target='_blank' class="github-corner" aria-label="View source on GitHub">
      <svg
        width="80"
        height="80"
        viewBox="0 0 250 250"
        style="fill: #151513; color: #fff; position: absolute; top: 0; border: 0; right: 0"
        aria-hidden="true"
      >
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path
          d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
          fill="currentColor"
          style="transform-origin: 130px 106px"
          class="octo-arm"
        ></path>
        <path
          d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
          fill="currentColor"
          class="octo-body"
        ></path>
      </svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-25deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
}

@media (max-width: 500px) {
  .github-corner:hover .octo-arm {
    animation: none;
  }

  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
}
</style>
