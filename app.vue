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

const isConnected = ref(false);

relay.on('connect', () => {
  console.log(`connected to ${relay.url}`);
  isConnected.value = true;
});
relay.on('error' as any, () => {
  console.log(`failed to connect to ${relay.url}`);
  isConnected.value = false;
});
relay.on('disconnect' as any, () => {
  isConnected.value = false;
  console.log(`disconnect from ${relay.url}`);
  relay.connect();
});
relay.on('notice' as any, () => {
  console.log(`notice  from ${relay.url}`);
});
const cats = [
  {
    id: '6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589',
    code: 'USDS',
    name: 'Stably USD',
    denom: 1000,
  },
  {
    id: 'a628c1c2c6fcb74d53746157e438e108eab5c0bb3e5c80ff9b1910b3e4832913',
    code: 'SBX',
    name: 'Spacebucks',
    denom: 1000,
  },
  {
    id: 'db1a9020d48d9d4ad22631b66ab4b9ebd3637ef7758ad38881348c5d24c38f20',
    code: 'DBX',
    name: 'dexie bucks',
    denom: 1000,
  },
  {
    id: '7108b478ac51f79b6ebf8ce40fa695e6eb6bef654a657d2694f1183deb78cc02',
    code: 'GAD',
    name: 'Green App Development',
    denom: 1000,
  },
  {
    id: '8ebf855de6eb146db5602f0456d2f0cbe750d57f821b6f91a8592ee9f1d4cf31',
    code: 'MRMT',
    name: 'Marmot Coin',
    denom: 1000,
  },
  {
    id: 'ec25b77bc54df637392d6a0f542de65f45020405d0f36ced723bff2870c378b1',
    code: 'MJO',
    name: 'MoJo•JoJo',
    denom: 1000,
  },
  {
    id: '509deafe3cd8bbfbb9ccce1d930e3d7b57b40c964fa33379b18d628175eb7a8f',
    code: 'CH21',
    name: 'Chia Holiday 2021',
    denom: 1000,
  },
  {
    id: 'ea830317f831a23b178aa653e50484568d30d2c5b34d8140e71247ead05961c7',
    code: 'CC',
    name: 'Caesar Coin',
    denom: 1000,
  },
  {
    id: '51ef89a35fa316c0f2747696b2483c9203da3155b603ea3f194640ada374907f',
    code: 'DCH',
    name: 'farmingDCH',
    denom: 1000,
  },
  {
    id: 'd5cfbfadf873554d5184ebcb9dee86e69f8b11f44a0cc4e417871c4f7fb17b9a',
    code: 'UFCG',
    name: 'UFC Genesis',
    denom: 1000,
  },
  {
    id: '0f8676bd61b83d8cc8543cf75a54bb6963ea7c9465eb2da4b84901778ad37d3f',
    code: 'XPCD',
    name: 'XCHPOOL Discount Coupon',
    denom: 1000,
  },
  {
    id: '79f6313fdb6ba66347a5bcad4af6878ac07bf5fafedeb384c3b350d913c8b6b6',
    code: 'NIOC',
    name: 'NioCoin',
    denom: 1000,
  },
  {
    id: '446f5c3532929f71fa82f1c65f7e93170dcfbf8d59baf82a81b6f8e8f85e8a5c',
    code: 'ALGOLD',
    name: 'Abandoned Land - Gold',
    denom: 1000,
  },
  {
    id: '482b49902d310c53065c3531d398d41808f1390590d566815d67040f6a32d124',
    code: 'CTK',
    name: 'Catkchi',
    denom: 1000,
  },
  {
    id: '4c4380af7d15c896d9e6266f322ac494c398803032eef56f2ab65877956d007f',
    code: 'NAME',
    name: 'Namesdao NAME',
    denom: 1000,
  },
  {
    id: '5fd27391e6385e5d4bdc5b7b2df67b2e8698e337d49b94302a3551deda565e58',
    code: 'POTT',
    name: 'Proof Of Treasure Coin',
    denom: 1000,
  },
  {
    id: '9995f30b83e7d3f3ea0eec7e450dbcade83f76516da79daa9a84a9daafec2329',
    code: 'ALWORK',
    name: 'Abandoned Land - Work',
    denom: 1000,
  },
  {
    id: '9995f30b83e7d3f3ea0eec7e450dbcade83f76516da79daa9a84a9daafec2329',
    code: 'ALWORK',
    name: 'Abandoned Land - Work',
    denom: 1000,
  },
  {
    id: 'ce9dfce94a5a65c0207bf3d57b407db559e9cd34f2050f8bd61291b42bead361',
    code: 'ALFOOD',
    name: 'Abandoned Land - Food',
    denom: 1000,
  },
  {
    id: '7d176bff0ac2e15fe6e5f57352e7c3a467b476a798dd38f30e39af7ef6cc52b4',
    code: 'ALORE',
    name: 'Abandoned Land - Ore',
    denom: 1000,
  },
  {
    id: '593c68c3f0c2061ea384ff30d9f3bef15039c6d5fbd46b555c73b2e9b490fca5',
    code: 'ALTOOL',
    name: 'Abandoned Land - Tool',
    denom: 1000,
  },
  {
    id: '3c75c138fe2fc94c0bae3467e7ae5a457758cb058925424ec2eb327f6b231a18',
    code: 'ALWEAP',
    name: 'Abandoned Land - Weapon',
    denom: 1000,
  },
  {
    id: '6daab7bb79093ef60f3b83dc3d9def25e91eae55916da8bf95268eda9ee871ea',
    code: 'ALWOOD',
    name: 'Abandoned Land - Wood',
    denom: 1000,
  },
];
const events = ref<any[]>([]);

let sub = relay.sub(
  [
    {
      kinds: [NOSTR_OFFER_TYPE],
      limit: 10,
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
      let containsNft = false;

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
              containsNft = true;
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
            containsNft = true;
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

      events.value.push({ ...event, offeredCoins, requestedPayments, status, containsNft });
    }
  } catch (e) {
    console.error(e);
  }
});
// sub.on('eose', () => {
//   console.log('eose');
//   sub.unsub();
// });

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
    </div>
  </div>
</template>