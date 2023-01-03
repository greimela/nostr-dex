// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindForms from '@tailwindcss/forms';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'nostr-dex',
      meta: [
        {
          name: 'description',
          content: 'An experimental trustless decentralized exchange using the nostr protocol and Chia offers.',
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
