// vite.config.ts
import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/@remix-run+dev@2.10.0_@remix-run+react@2.10.2_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_slzkzueigaz4s7wddy3rpuu65a/node_modules/@remix-run/dev/dist/index.js";
import UnoCSS from "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/unocss@0.61.3_postcss@8.4.38_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/unocss/dist/vite.mjs";
import { defineConfig } from "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.9_sass@1.77.6/node_modules/vite/dist/node/index.js";
import { nodePolyfills } from "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/vite-plugin-node-polyfills@0.22.0_rollup@4.18.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-node-polyfills/dist/index.js";
import "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/vite-plugin-optimize-css-modules@1.1.0_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-plugin-optimize-css-modules/dist/index.mjs";
import tsconfigPaths from "file:///C:/Users/aish1/Videos/thor.dev/builder/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@5.3.1_@types+node@20.14.9_sass@1.77.6_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import path from "node:path";
var __vite_injected_original_dirname = "C:\\Users\\aish1\\Videos\\thor.dev\\builder";
var vite_config_default = defineConfig((config) => {
  return {
    define: {
      global: "globalThis",
      "process.env": {}
    },
    build: {
      target: "esnext",
      commonjsOptions: {
        include: [
          /node_modules/,
          "react-use",
          "fast-deep-equal/react"
        ]
      },
      cssMinify: true
    },
    resolve: {
      conditions: ["workerd", "worker"],
      alias: {
        // Let node-polyfills handle path module
      }
    },
    plugins: [
      nodePolyfills({
        include: ["buffer", "util", "events"],
        globals: {
          global: true,
          process: true,
          Buffer: true
        },
        protocolImports: true
      }),
      config.mode !== "test" && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true
        }
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      // Custom plugin to replace server-only imports in @remix-run/react
      {
        name: "remix-server-module-replacer",
        transform(code, id) {
          if (id.includes("node_modules/@remix-run/react/dist/esm/single-fetch.js")) {
            code = code.replace(
              /import { UNSAFE_ErrorResponseImpl, redirect } from '@remix-run\/router';/,
              ""
            );
            code = code.replace(
              /import { UNSAFE_SingleFetchRedirectSymbol } from '@remix-run\/server-runtime';/,
              ""
            );
            return { code, map: null };
          }
          return null;
        }
      }
      // config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    optimizeDeps: {
      include: ["fast-deep-equal/react", "gsap"],
      exclude: ["@gsap/react", "react-use", "fast-deep-equal"]
    },
    ssr: {
      noExternal: [
        // This is a temporary workaround to avoid a bug in Vite that prevents
        // `virtual-module` from being externalized. This will be removed once
        // the bug is fixed.
        "virtual-module"
        // Make sure to enable this when you are using a package that is not
        // compatible with ESM. For example, if you are using a package that
        // uses `require` instead of `import`.
        // "your-package-name",
      ],
      target: "webworker",
      resolve: {
        conditions: ["workerd", "worker"],
        alias: {
          "~": path.resolve(__vite_injected_original_dirname, "./app"),
          "@": path.resolve(__vite_injected_original_dirname, "./app")
        }
      }
    },
    envPrefix: ["VITE_", "OPENAI_LIKE_API_", "OLLAMA_API_BASE_URL"],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  };
});
function chrome129IssuePlugin() {
  return {
    name: "chrome129IssuePlugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers["user-agent"]?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader("content-type", "text/html");
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/thor-dev/thor.dev/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>'
            );
            return;
          }
        }
        next();
      });
    }
  };
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhaXNoMVxcXFxWaWRlb3NcXFxcdGhvci5kZXZcXFxcYnVpbGRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWlzaDFcXFxcVmlkZW9zXFxcXHRob3IuZGV2XFxcXGJ1aWxkZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2Fpc2gxL1ZpZGVvcy90aG9yLmRldi9idWlsZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbiBhcyByZW1peENsb3VkZmxhcmVEZXZQcm94eSwgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xyXG5pbXBvcnQgeyBvcHRpbWl6ZUNzc01vZHVsZXMgfSBmcm9tICd2aXRlLXBsdWdpbi1vcHRpbWl6ZS1jc3MtbW9kdWxlcyc7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxyXG4gICAgICAncHJvY2Vzcy5lbnYnOiB7fSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcclxuICAgICAgICBpbmNsdWRlOiBbL25vZGVfbW9kdWxlcy8sXHJcbiAgICAgICAgICAncmVhY3QtdXNlJyxcclxuICAgICAgICAgICdmYXN0LWRlZXAtZXF1YWwvcmVhY3QnXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAgY3NzTWluaWZ5OiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgIGNvbmRpdGlvbnM6IFsnd29ya2VyZCcsICd3b3JrZXInXSxcclxuICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgIC8vIExldCBub2RlLXBvbHlmaWxscyBoYW5kbGUgcGF0aCBtb2R1bGVcclxuICAgICAgIH0sXHJcbiAgICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgbm9kZVBvbHlmaWxscyh7XHJcbiAgICAgICAgaW5jbHVkZTogWydidWZmZXInLCAndXRpbCcsICdldmVudHMnXSxcclxuICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICBnbG9iYWw6IHRydWUsXHJcbiAgICAgICAgICBwcm9jZXNzOiB0cnVlLFxyXG4gICAgICAgICAgQnVmZmVyOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxyXG4gICAgICB9KSxcclxuICAgICAgY29uZmlnLm1vZGUgIT09ICd0ZXN0JyAmJiByZW1peENsb3VkZmxhcmVEZXZQcm94eSgpLFxyXG4gICAgICByZW1peFZpdGVQbHVnaW4oe1xyXG4gICAgICAgIGZ1dHVyZToge1xyXG4gICAgICAgICAgdjNfZmV0Y2hlclBlcnNpc3Q6IHRydWUsXHJcbiAgICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcclxuICAgICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICAgIFVub0NTUygpLFxyXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXHJcbiAgICAgIGNocm9tZTEyOUlzc3VlUGx1Z2luKCksXHJcbiAgICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gcmVwbGFjZSBzZXJ2ZXItb25seSBpbXBvcnRzIGluIEByZW1peC1ydW4vcmVhY3RcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdyZW1peC1zZXJ2ZXItbW9kdWxlLXJlcGxhY2VyJyxcclxuICAgICAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcclxuICAgICAgICAgIC8vIFRhcmdldCB0aGUgc3BlY2lmaWMgZmlsZSB3aXRoaW4gbm9kZV9tb2R1bGVzXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmVtaXgtcnVuL3JlYWN0L2Rpc3QvZXNtL3NpbmdsZS1mZXRjaC5qcycpKSB7XHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIGltcG9ydCBzdGF0ZW1lbnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgL2ltcG9ydCB7IFVOU0FGRV9FcnJvclJlc3BvbnNlSW1wbCwgcmVkaXJlY3QgfSBmcm9tICdAcmVtaXgtcnVuXFwvcm91dGVyJzsvLFxyXG4gICAgICAgICAgICAgICcnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgL2ltcG9ydCB7IFVOU0FGRV9TaW5nbGVGZXRjaFJlZGlyZWN0U3ltYm9sIH0gZnJvbSAnQHJlbWl4LXJ1blxcL3NlcnZlci1ydW50aW1lJzsvLFxyXG4gICAgICAgICAgICAgICcnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IGNvZGUsIG1hcDogbnVsbCB9OyAvLyBSZXR1cm4gdGhlIHRyYW5zZm9ybWVkIGNvZGVcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBudWxsOyAvLyBObyBjaGFuZ2VzIGZvciBvdGhlciBtb2R1bGVzXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgLy8gY29uZmlnLm1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiBvcHRpbWl6ZUNzc01vZHVsZXMoeyBhcHBseTogJ2J1aWxkJyB9KSxcclxuICAgIF0sXHJcbiAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgaW5jbHVkZTogWydmYXN0LWRlZXAtZXF1YWwvcmVhY3QnLCAnZ3NhcCddLFxyXG4gICAgICBleGNsdWRlOiBbJ0Bnc2FwL3JlYWN0JywgJ3JlYWN0LXVzZScsICdmYXN0LWRlZXAtZXF1YWwnXSxcclxuICAgIH0sXHJcbiAgICBzc3I6IHtcclxuICAgICAgbm9FeHRlcm5hbDogW1xyXG4gICAgICAgIC8vIFRoaXMgaXMgYSB0ZW1wb3Jhcnkgd29ya2Fyb3VuZCB0byBhdm9pZCBhIGJ1ZyBpbiBWaXRlIHRoYXQgcHJldmVudHNcclxuICAgICAgICAvLyBgdmlydHVhbC1tb2R1bGVgIGZyb20gYmVpbmcgZXh0ZXJuYWxpemVkLiBUaGlzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlXHJcbiAgICAgICAgLy8gdGhlIGJ1ZyBpcyBmaXhlZC5cclxuICAgICAgICBcInZpcnR1YWwtbW9kdWxlXCIsXHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGVuYWJsZSB0aGlzIHdoZW4geW91IGFyZSB1c2luZyBhIHBhY2thZ2UgdGhhdCBpcyBub3RcclxuICAgICAgICAvLyBjb21wYXRpYmxlIHdpdGggRVNNLiBGb3IgZXhhbXBsZSwgaWYgeW91IGFyZSB1c2luZyBhIHBhY2thZ2UgdGhhdFxyXG4gICAgICAgIC8vIHVzZXMgYHJlcXVpcmVgIGluc3RlYWQgb2YgYGltcG9ydGAuXHJcbiAgICAgICAgLy8gXCJ5b3VyLXBhY2thZ2UtbmFtZVwiLFxyXG4gICAgICBdLFxyXG4gICAgICB0YXJnZXQ6ICd3ZWJ3b3JrZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgY29uZGl0aW9uczogWyd3b3JrZXJkJywgJ3dvcmtlciddLFxyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAnfic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2FwcCcpLFxyXG4gICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9hcHAnKSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG5cclxuICAgIH0sXHJcbiAgICBlbnZQcmVmaXg6W1wiVklURV9cIixcIk9QRU5BSV9MSUtFX0FQSV9cIixcIk9MTEFNQV9BUElfQkFTRV9VUkxcIl0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2Nocm9tZTEyOUlzc3VlUGx1Z2luJyxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXI6IFZpdGVEZXZTZXJ2ZXIpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICBjb25zdCByYXcgPSByZXEuaGVhZGVyc1sndXNlci1hZ2VudCddPy5tYXRjaCgvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vKTtcclxuXHJcbiAgICAgICAgaWYgKHJhdykge1xyXG4gICAgICAgICAgY29uc3QgdmVyc2lvbiA9IHBhcnNlSW50KHJhd1syXSwgMTApO1xyXG5cclxuICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAxMjkpIHtcclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignY29udGVudC10eXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICByZXMuZW5kKFxyXG4gICAgICAgICAgICAgICc8Ym9keT48aDE+UGxlYXNlIHVzZSBDaHJvbWUgQ2FuYXJ5IGZvciB0ZXN0aW5nLjwvaDE+PHA+Q2hyb21lIDEyOSBoYXMgYW4gaXNzdWUgd2l0aCBKYXZhU2NyaXB0IG1vZHVsZXMgJiBWaXRlIGxvY2FsIGRldmVsb3BtZW50LCBzZWUgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS90aG9yLWRldi90aG9yLmRldi9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTIzOTU1MTkyNThcIj5mb3IgbW9yZSBpbmZvcm1hdGlvbi48L2E+PC9wPjxwPjxiPk5vdGU6PC9iPiBUaGlzIG9ubHkgaW1wYWN0cyA8dT5sb2NhbCBkZXZlbG9wbWVudDwvdT4uIGBwbnBtIHJ1biBidWlsZGAgYW5kIGBwbnBtIHJ1biBzdGFydGAgd2lsbCB3b3JrIGZpbmUgaW4gdGhpcyBicm93c2VyLjwvcD48L2JvZHk+JyxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5leHQoKTtcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLGdDQUFnQyx5QkFBeUIsY0FBYyx1QkFBdUI7QUFDdlosT0FBTyxZQUFZO0FBQ25CLFNBQVMsb0JBQXdDO0FBQ2pELFNBQVMscUJBQXFCO0FBQzlCLE9BQW1DO0FBQ25DLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sVUFBVTtBQU5qQixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxXQUFXO0FBQ3RDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxN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
