import { Ref } from '@vue/reactivity';

const isGobyInstalled = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const { chia } = window as any;
  return Boolean(chia && chia.isGoby);
};

export const requestAccounts = async (goby: Ref) => {
  if (goby.value.isGobyInstalled) {
    const accounts = await (window as any).chia.request({ method: 'requestAccounts' });
    goby.value.account = accounts?.[0];
  }
};

export const takeOffer = async (goby: Ref, offer: { offer: string }) => {
  if (goby.value.isGobyInstalled) {
    try {
      await (window as any).chia.request({ method: 'takeOffer', params: { offer: offer.offer, fee: 0 } });
    } catch (e) {}
  }
};

export const useGoby = () => {
  const goby = useState('goby', () => ({ account: '', isGobyInstalled: false }));

  if (!goby.value.isGobyInstalled && isGobyInstalled()) {
    goby.value.isGobyInstalled = true;

    (window as any).chia.on('accountsChanged', (accounts: any[] | undefined) => {
      goby.value.account = accounts?.[0];
    });
    (window as any).chia.on('chainChanged', () => window.location.reload());
    (window as any).chia.request({ method: 'accounts' }).then((accounts: any[] | undefined) => {
      goby.value.account = accounts?.[0];
    });
  }

  return {
    goby,
    requestAccounts: () => requestAccounts(goby),
    takeOffer: (offer: { offer: string }) => takeOffer(goby, offer),
  };
};
