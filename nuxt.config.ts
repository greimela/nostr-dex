// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindForms from '@tailwindcss/forms';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxt/devtools', '@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'nostr-dex | Trustless Chia DEX on Nostr',
      meta: [
        {
          name: 'description',
          content:
            'nostr-dex is an experimental trustless decentralized exchange using the nostr protocol and Chia offers.',
        },
      ],
    },
  },
  tailwindcss: {
    config: {
      plugins: [tailwindForms],
    },
  },
  vite: {
    resolve: {
      alias: {
        stream: 'stream-browserify',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [NodeGlobalsPolyfillPlugin()],
      },
    },
  },
});
