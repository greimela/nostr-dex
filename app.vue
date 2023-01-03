<script setup lang="ts">
import { Buffer } from 'buffer';
import { generatePrivateKey, getEventHash, getPublicKey, relayInit, signEvent } from 'nostr-tools';
import { ref } from 'vue';
import { BigNumber, util } from 'greenwebjs';
import { Offer } from '~/chia/offer';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

window.Buffer = Buffer;

const NOSTR_OFFER_TYPE = 8444;

const relay = relayInit('wss://nostr.8e23.net');
await relay.connect();

relay.on('connect', () => {
  console.log(`connected to ${relay.url}`);
});
relay.on('error' as any, () => {
  console.log(`failed to connect to ${relay.url}`);
});
relay.on('disconnect' as any, () => {
  console.log(`disconnect from ${relay.url}`);
  relay.connect();

});
relay.on('notice' as any, () => {
  console.log(`notice  from ${relay.url}`);
});
const cats = [
  {
    id: 'a628c1c2c6fcb74d53746157e438e108eab5c0bb3e5c80ff9b1910b3e4832913',
    code: 'SBX',
    name: 'Spacebucks',
    denom: 1000,
  },
  {
    id: '6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589',
    code: 'USDS',
    name: 'Stably USD',
    denom: 1000,
  },
  {
    id: 'db1a9020d48d9d4ad22631b66ab4b9ebd3637ef7758ad38881348c5d24c38f20',
    code: 'DBX',
    name: 'dexie bucks',
    denom: 1000,
  },
  {
    id: '8ebf855de6eb146db5602f0456d2f0cbe750d57f821b6f91a8592ee9f1d4cf31',
    code: 'MRMT',
    name: 'Marmot Coin',
    denom: 1000,
  },
];
const events = ref<any[]>([]);

let sub = relay.sub(
  [
    {
      kinds: [NOSTR_OFFER_TYPE],
      limit: 10
      // '#a': ['6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'],
      // '#a': ['6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589'],
      // '#c': ['col1z0ef7w5n4vq9qkue67y8jnwumd9799sm50t8fyle73c70ly4z0ws0p2rhl'],
      // authors: ['214fa97d9d406ba5e447035c312c2ee5ecf4fde91cde359917472ea9193d76b7']
    },
  ],
  {}
);
sub.on('event', async (event: any) => {
  try {
    if (event.content.startsWith('offer1')) {
      // console.log('offer---');
      // console.log(event.content);
      const offer: Offer = Offer.from_bech32(event.content);
      let status = 'active';

      const offeredCoins: any[] = [];
      for (const [assetId, offeredCoinsForAsset] of Object.entries(offer.getOfferedCoins())) {
        for (const offeredCoin of offeredCoinsForAsset) {
          // console.log({ assetId, offeredCoin });

          let nft, cat;
          if (assetId.startsWith('nft')) {
            try {
              const nftResponse = await $fetch<any>(`https://api.mintgarden.io/nfts/${assetId}`);
              nft = {
                id: nftResponse.encoded_id,
                name: nftResponse.data?.metadata_json?.name,
                thumbnail_uri: nftResponse.data?.thumbnail_uri,
              };
            } catch (e) {
              return;
            }
          } else if (assetId) {
            //CAT
            const existingCat = cats.find((cat) => cat.id === assetId);
            cat = { tailHash: assetId, symbol: existingCat?.code || 'UNKNOWN' };
          }

          const coinResult = await $fetch<any>(
            `https://api2.spacescan.io/1/xch/coin/${util.coin.getName(offeredCoin)}`
          );
          if (coinResult && coinResult.coin && coinResult.coin.spent_index) {
            status = 'spent';
          }

          // TODO check the input coins for existence to filter out testnet/fake offers

          offeredCoins.push({ amount: offeredCoin.amount, nft, cat });
        }
      }

      const requestedPayments: any[] = [];
      for (const [assetId, assetRequestedPayments] of Object.entries(offer.requestedPayments)) {
        let nft, cat;
        if (assetId.startsWith('nft')) {
          try {
            const nftResponse = await $fetch<any>(`https://api.mintgarden.io/nfts/${assetId}`);
            nft = {
              id: nftResponse.encoded_id,
              name: nftResponse.data?.metadata_json?.name,
              thumbnail_uri: nftResponse.data?.thumbnail_uri,
            };
          } catch (e) {
            return;
          }
        } else if (assetId) {
          //CAT
          const existingCat = cats.find((cat) => cat.id === assetId);
          cat = { tailHash: assetId, symbol: existingCat?.code || 'UNKNOWN' };
        }
        const amount = assetRequestedPayments.reduce((acc, val) => acc.add(val.amount), BigNumber.from(0));
        requestedPayments.push({ assetId, cat, nft, amount });
      }

      events.value.push({ ...event, offeredCoins, requestedPayments, status });
    }
  } catch (e) {
    console.error(e);
  }
});
// sub.on('eose', () => {
//   console.log('eose');
//   sub.unsub();
// });

const sortedEvents = computed(() =>
  events.value
    .filter((event) => (onlyShowActiveOffers.value ? event.status === 'active' : true))
    .sort((a, b) => b.created_at - a.created_at)
);

let sk = generatePrivateKey();
let pk = getPublicKey(sk);

const newOfferString = ref('');
const postOffer = async () => {
  try {
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

const onlyShowActiveOffers = ref(true);
</script>
<template>
  <div>
    <div class="bg-slate-50 px-4 pt-16 pb-20 sm:px-6">
      <div class="relative mx-auto max-w-lg">
        <h1 class="text-6xl font-medium text-center">nostr-dex</h1>
        <p class="mt-4 text-center text-gray-400">
          An experimental trustless decentralized exchange using the nostr protocol and Chia offers.
        </p>
        <form action="#" @submit.prevent="postOffer" class="mt-16 relative bg-white">
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
            <div class="flex items-center space-x-5">
              <!--            <div class="flex items-center">-->
              <!--              <button type="button" class="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">-->
              <!--                <PaperClipIcon class="h-5 w-5" aria-hidden="true" />-->
              <!--                <span class="sr-only">Attach a file</span>-->
              <!--              </button>-->
              <!--            </div>-->
              <!--            <div class="flex items-center">-->
              <!--            </div>-->
            </div>
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

        <div class="mt-8 flex justify-center">
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
        </div>
        <div class="mt-8 grid gap-8">
          <div v-for="event in sortedEvents" :key="event.id">
            <div class="overflow-hidden rounded-lg bg-white shadow">
              <div class="px-4 py-5 sm:p-6 grid grid-cols-2 gap-2">
                <div>
                  <div v-for="requestedPayment in event.requestedPayments">
                    <NuxtLink
                      target="_blank"
                      :to="`https://mintgarden.io/nfts/${requestedPayment.nft.id}`"
                      v-if="requestedPayment.nft"
                    >
                      <img :src="requestedPayment.nft.thumbnail_uri" />
                      {{ requestedPayment.nft.name }}
                    </NuxtLink>
                    <div v-else-if="requestedPayment.cat">
                      {{ util.formatToken(requestedPayment.amount) }} {{ requestedPayment.cat.symbol }}
                    </div>
                    <div v-else>{{ util.formatChia(requestedPayment.amount) }} XCH</div>
                  </div>
                </div>
                <div>
                  <div v-for="offeredCoin in event.offeredCoins">
                    <NuxtLink
                      target="_blank"
                      :to="`https://mintgarden.io/nfts/${offeredCoin.nft.id}`"
                      v-if="offeredCoin.nft"
                    >
                      <img :src="offeredCoin.nft.thumbnail_uri" />
                      {{ offeredCoin.nft.name }}
                    </NuxtLink>
                    <div v-else-if="offeredCoin.cat">
                      {{ util.formatToken(offeredCoin.amount) }} {{ offeredCoin.cat.symbol }}
                    </div>
                    <div v-else>{{ util.formatChia(offeredCoin.amount) }} XCH</div>
                  </div>
                </div>
              </div>
              <div class="p-4" v-if="event.status === 'active'">
                <TakeOfferButton :offer="{ offer: event.content }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>