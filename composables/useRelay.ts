import { Filter, Relay, relayInit, Event } from 'nostr-tools';
import { Offer } from '~/chia/offer';
import { cats } from '~/cats';
import { BigNumber, util } from 'greenwebjs';

export const NOSTR_OFFER_TYPE = 8444;

export const useRelay = async () => {
  const relay = useState<Relay | undefined>('relay');
  const isConnected = useState<boolean>('isRelayConnected', () => false);

  if (!relay.value) {
    relay.value = relayInit('wss://nostr.8e23.net');
    await relay.value.connect();

    relay.value.on('connect', () => {
      console.log(`connected to ${relay.value!.url}`);
      isConnected.value = true;
    });
    relay.value.on('error' as any, () => {
      console.log(`failed to connect to ${relay.value!.url}`);
      isConnected.value = false;
    });
    relay.value.on('disconnect' as any, () => {
      isConnected.value = false;
      console.log(`disconnect from ${relay.value!.url}`);
      relay.value?.connect();
    });
    relay.value.on('notice' as any, () => {
      console.log(`notice  from ${relay.value!.url}`);
    });
  }

  function subscribeToEvents(filter: Filter, callback: any) {
    if (!relay.value) {
      throw new Error('Relay not initialized');
    }
    const sub = relay.value.sub([filter]);
    sub.on('event', async (event: Event) => {
      if (event.content.startsWith('offer1')) {
        try {
          return callback(await parseOfferEvent(event));
        } catch (e) {
          console.error('Failed to parse offer', e);
        }
      }
      return callback(event);
    });
    return sub;
  }

  function publish(event: Event) {
    return new Promise<void>((resolve, reject) => {
      if (!relay.value) {
        reject('Relay not initialized');
        return;
      }
      let pub = relay.value.publish(event);
      pub.on('ok', () => {
        console.log(`${relay.value!.url} has accepted our event`);
      });
      pub.on('seen', () => {
        console.log(`we saw the event on ${relay.value!.url}`);
        resolve();
      });
      pub.on('failed', (reason: any) => {
        console.log(`failed to publish to ${relay.value!.url}: ${reason}`);
        reject(reason);
      });
    });
  }

  return { isConnected, subscribeToEvents, publish };
};

async function parseOfferEvent(event: Event) {
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

      const coinResult = await $fetch<any>(`https://api2.spacescan.io/1/xch/coin/${util.coin.getName(offeredCoin)}`);
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

  return { ...event, offeredCoins, requestedPayments, status, containsNft };
}
