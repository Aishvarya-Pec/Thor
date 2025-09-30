import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig((config) => {
  return {
    define: {
      global: 'globalThis',
      'process.env': {},
    },
    // Optimize for Vercel deployment
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-use': ['react-use'],
            'fast-deep-equal/react': ['fast-deep-equal/react']
          },
        },
      },
      cssMinify: true,
    },
    resolve: {
       conditions: ['workerd', 'worker'],
       alias: {
         // Let node-polyfills handle path module
       },
       dedupe: ['react', 'react-dom'],
     },
    plugins: [
      nodePolyfills({
        include: ["buffer", "util", "events"],
        globals: {
          global: true,
          process: true,
          Buffer: true,
        },
        protocolImports: true,
      }),
      config.mode !== 'test' && remixCloudflareDevProxy(),
      remixVitePlugin({
        // viteEnvironment: { name: "ssr" }, // removed – not a valid Remix plugin option
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      // Custom plugin to replace server-only imports in @remix-run/react
      // {
      //   name: 'remix-server-module-replacer',
      //   transform(code, id) {
      //     // Target the specific file within node_modules
      //     if (id.includes('node_modules/@remix-run/react/dist/esm/single-fetch.js')) {
      //       // Replace the import statements with an empty string
      //       code = code.replace(
      //         /import { UNSAFE_ErrorResponseImpl, redirect } from '@remix-run\/router';/,
      //         ''
      //       );
      //       code = code.replace(
      //         /import { UNSAFE_SingleFetchRedirectSymbol } from '@remix-run\/server-runtime';/,
      //         ''
      //       );
      //       return { code, map: null }; // Return the transformed code
      //     }
      //     return null; // No changes for other modules
      //   },
      // },
      // config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    optimizeDeps: {
      include: [
        "fast-content-type-parse",
        "jszip",
        "file-saver",
        "react-dom",
        "@xterm/addon-fit",
        "@xterm/addon-web-links",
        "@xterm/xterm",
        "style-to-js",
        "debug",
        "ms",
      ],
      noDiscovery: false,
    },
    ssr: {
      noExternal: [
      ],
      target: 'webworker',
      resolve: {
        conditions: ['workerd', 'worker'],
        alias: {
          '~': path.resolve(__dirname, './app'),
          '@': path.resolve(__dirname, './app'),
        },
      },

    },
    envPrefix:["VITE_","OPENAI_LIKE_API_","OLLAMA_API_BASE_URL"],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/thor-dev/thor.dev/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}
