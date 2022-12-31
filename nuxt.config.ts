// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindForms from '@tailwindcss/forms'
import NodeGlobalsPolyfillPlugin from "@esbuild-plugins/node-globals-polyfill";


export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  tailwindcss: {
    config: {
      plugins: [tailwindForms]
    }
  },
  vite: {
    resolve: {
      alias: {
        stream: 'stream-browserify',
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin()
        ],
      },
    },
  },
})
