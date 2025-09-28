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
    // Optimize for Vercel deployment
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
            editor: ["@codemirror/view", "@codemirror/state", "@codemirror/language"]
          }
        }
      },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhaXNoMVxcXFxWaWRlb3NcXFxcdGhvci5kZXZcXFxcYnVpbGRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWlzaDFcXFxcVmlkZW9zXFxcXHRob3IuZGV2XFxcXGJ1aWxkZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2Fpc2gxL1ZpZGVvcy90aG9yLmRldi9idWlsZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbiBhcyByZW1peENsb3VkZmxhcmVEZXZQcm94eSwgdml0ZVBsdWdpbiBhcyByZW1peFZpdGVQbHVnaW4gfSBmcm9tICdAcmVtaXgtcnVuL2Rldic7XHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgVml0ZURldlNlcnZlciB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xyXG5pbXBvcnQgeyBvcHRpbWl6ZUNzc01vZHVsZXMgfSBmcm9tICd2aXRlLXBsdWdpbi1vcHRpbWl6ZS1jc3MtbW9kdWxlcyc7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChjb25maWcpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxyXG4gICAgICAncHJvY2Vzcy5lbnYnOiB7fSxcclxuICAgIH0sXHJcbiAgICAvLyBPcHRpbWl6ZSBmb3IgVmVyY2VsIGRlcGxveW1lbnRcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAgIHVpOiBbJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnXSxcclxuICAgICAgICAgICAgZWRpdG9yOiBbJ0Bjb2RlbWlycm9yL3ZpZXcnLCAnQGNvZGVtaXJyb3Ivc3RhdGUnLCAnQGNvZGVtaXJyb3IvbGFuZ3VhZ2UnXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvLFxyXG4gICAgICAgICAgJ3JlYWN0LXVzZScsXHJcbiAgICAgICAgICAnZmFzdC1kZWVwLWVxdWFsL3JlYWN0J1xyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGNzc01pbmlmeTogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICBjb25kaXRpb25zOiBbJ3dvcmtlcmQnLCAnd29ya2VyJ10sXHJcbiAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAvLyBMZXQgbm9kZS1wb2x5ZmlsbHMgaGFuZGxlIHBhdGggbW9kdWxlXHJcbiAgICAgICB9LFxyXG4gICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICAgIGluY2x1ZGU6IFsnYnVmZmVyJywgJ3V0aWwnLCAnZXZlbnRzJ10sXHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgZ2xvYmFsOiB0cnVlLFxyXG4gICAgICAgICAgcHJvY2VzczogdHJ1ZSxcclxuICAgICAgICAgIEJ1ZmZlcjogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICAgIGNvbmZpZy5tb2RlICE9PSAndGVzdCcgJiYgcmVtaXhDbG91ZGZsYXJlRGV2UHJveHkoKSxcclxuICAgICAgcmVtaXhWaXRlUGx1Z2luKHtcclxuICAgICAgICBmdXR1cmU6IHtcclxuICAgICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxyXG4gICAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXHJcbiAgICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgICBVbm9DU1MoKSxcclxuICAgICAgdHNjb25maWdQYXRocygpLFxyXG4gICAgICBjaHJvbWUxMjlJc3N1ZVBsdWdpbigpLFxyXG4gICAgICAvLyBDdXN0b20gcGx1Z2luIHRvIHJlcGxhY2Ugc2VydmVyLW9ubHkgaW1wb3J0cyBpbiBAcmVtaXgtcnVuL3JlYWN0XHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAncmVtaXgtc2VydmVyLW1vZHVsZS1yZXBsYWNlcicsXHJcbiAgICAgICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XHJcbiAgICAgICAgICAvLyBUYXJnZXQgdGhlIHNwZWNpZmljIGZpbGUgd2l0aGluIG5vZGVfbW9kdWxlc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJlbWl4LXJ1bi9yZWFjdC9kaXN0L2VzbS9zaW5nbGUtZmV0Y2guanMnKSkge1xyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBpbXBvcnQgc3RhdGVtZW50cyB3aXRoIGFuIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgICAgICBjb2RlID0gY29kZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgIC9pbXBvcnQgeyBVTlNBRkVfRXJyb3JSZXNwb25zZUltcGwsIHJlZGlyZWN0IH0gZnJvbSAnQHJlbWl4LXJ1blxcL3JvdXRlcic7LyxcclxuICAgICAgICAgICAgICAnJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb2RlID0gY29kZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgIC9pbXBvcnQgeyBVTlNBRkVfU2luZ2xlRmV0Y2hSZWRpcmVjdFN5bWJvbCB9IGZyb20gJ0ByZW1peC1ydW5cXC9zZXJ2ZXItcnVudGltZSc7LyxcclxuICAgICAgICAgICAgICAnJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4geyBjb2RlLCBtYXA6IG51bGwgfTsgLy8gUmV0dXJuIHRoZSB0cmFuc2Zvcm1lZCBjb2RlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gTm8gY2hhbmdlcyBmb3Igb3RoZXIgbW9kdWxlc1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIGNvbmZpZy5tb2RlID09PSAncHJvZHVjdGlvbicgJiYgb3B0aW1pemVDc3NNb2R1bGVzKHsgYXBwbHk6ICdidWlsZCcgfSksXHJcbiAgICBdLFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFsnZmFzdC1kZWVwLWVxdWFsL3JlYWN0JywgJ2dzYXAnXSxcclxuICAgICAgZXhjbHVkZTogWydAZ3NhcC9yZWFjdCcsICdyZWFjdC11c2UnLCAnZmFzdC1kZWVwLWVxdWFsJ10sXHJcbiAgICB9LFxyXG4gICAgc3NyOiB7XHJcbiAgICAgIG5vRXh0ZXJuYWw6IFtcclxuICAgICAgICAvLyBUaGlzIGlzIGEgdGVtcG9yYXJ5IHdvcmthcm91bmQgdG8gYXZvaWQgYSBidWcgaW4gVml0ZSB0aGF0IHByZXZlbnRzXHJcbiAgICAgICAgLy8gYHZpcnR1YWwtbW9kdWxlYCBmcm9tIGJlaW5nIGV4dGVybmFsaXplZC4gVGhpcyB3aWxsIGJlIHJlbW92ZWQgb25jZVxyXG4gICAgICAgIC8vIHRoZSBidWcgaXMgZml4ZWQuXHJcbiAgICAgICAgXCJ2aXJ0dWFsLW1vZHVsZVwiLFxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0byBlbmFibGUgdGhpcyB3aGVuIHlvdSBhcmUgdXNpbmcgYSBwYWNrYWdlIHRoYXQgaXMgbm90XHJcbiAgICAgICAgLy8gY29tcGF0aWJsZSB3aXRoIEVTTS4gRm9yIGV4YW1wbGUsIGlmIHlvdSBhcmUgdXNpbmcgYSBwYWNrYWdlIHRoYXRcclxuICAgICAgICAvLyB1c2VzIGByZXF1aXJlYCBpbnN0ZWFkIG9mIGBpbXBvcnRgLlxyXG4gICAgICAgIC8vIFwieW91ci1wYWNrYWdlLW5hbWVcIixcclxuICAgICAgXSxcclxuICAgICAgdGFyZ2V0OiAnd2Vid29ya2VyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGNvbmRpdGlvbnM6IFsnd29ya2VyZCcsICd3b3JrZXInXSxcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgJ34nOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9hcHAnKSxcclxuICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vYXBwJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuXHJcbiAgICB9LFxyXG4gICAgZW52UHJlZml4OltcIlZJVEVfXCIsXCJPUEVOQUlfTElLRV9BUElfXCIsXCJPTExBTUFfQVBJX0JBU0VfVVJMXCJdLFxyXG4gICAgY3NzOiB7XHJcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICBzY3NzOiB7XHJcbiAgICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gY2hyb21lMTI5SXNzdWVQbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdjaHJvbWUxMjlJc3N1ZVBsdWdpbicsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmF3ID0gcmVxLmhlYWRlcnNbJ3VzZXItYWdlbnQnXT8ubWF0Y2goL0Nocm9tKGV8aXVtKVxcLyhbMC05XSspXFwuLyk7XHJcblxyXG4gICAgICAgIGlmIChyYXcpIHtcclxuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSBwYXJzZUludChyYXdbMl0sIDEwKTtcclxuXHJcbiAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gMTI5KSB7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgcmVzLmVuZChcclxuICAgICAgICAgICAgICAnPGJvZHk+PGgxPlBsZWFzZSB1c2UgQ2hyb21lIENhbmFyeSBmb3IgdGVzdGluZy48L2gxPjxwPkNocm9tZSAxMjkgaGFzIGFuIGlzc3VlIHdpdGggSmF2YVNjcmlwdCBtb2R1bGVzICYgVml0ZSBsb2NhbCBkZXZlbG9wbWVudCwgc2VlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdGhvci1kZXYvdGhvci5kZXYvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0yMzk1NTE5MjU4XCI+Zm9yIG1vcmUgaW5mb3JtYXRpb24uPC9hPjwvcD48cD48Yj5Ob3RlOjwvYj4gVGhpcyBvbmx5IGltcGFjdHMgPHU+bG9jYWwgZGV2ZWxvcG1lbnQ8L3U+LiBgcG5wbSBydW4gYnVpbGRgIGFuZCBgcG5wbSBydW4gc3RhcnRgIHdpbGwgd29yayBmaW5lIGluIHRoaXMgYnJvd3Nlci48L3A+PC9ib2R5PicsXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1QsU0FBUyxnQ0FBZ0MseUJBQXlCLGNBQWMsdUJBQXVCO0FBQ3ZaLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUF3QztBQUNqRCxTQUFTLHFCQUFxQjtBQUM5QixPQUFtQztBQUNuQyxPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFVBQVU7QUFOakIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsV0FBVztBQUN0QyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixlQUFlLENBQUM7QUFBQSxJQUNsQjtBQUFBO0FBQUEsSUFFQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDN0IsSUFBSSxDQUFDLDBCQUEwQiwrQkFBK0I7QUFBQSxZQUM5RCxRQUFRLENBQUMsb0JBQW9CLHFCQUFxQixzQkFBc0I7QUFBQSxVQUMxRTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxpQkFBaUI7QUFBQSxRQUNmLFNBQVM7QUFBQSxVQUFDO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNOLFlBQVksQ0FBQyxXQUFXLFFBQVE7QUFBQSxNQUNoQyxPQUFPO0FBQUE7QUFBQSxNQUVQO0FBQUEsSUFDRjtBQUFBLElBQ0QsU0FBUztBQUFBLE1BQ1AsY0FBYztBQUFBLFFBQ1osU0FBUyxDQUFDLFVBQVUsUUFBUSxRQUFRO0FBQUEsUUFDcEMsU0FBUztBQUFBLFVBQ1AsUUFBUTtBQUFBLFVBQ1IsU0FBUztBQUFBLFVBQ1QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLGlCQUFpQjtBQUFBLE1BQ25CLENBQUM7QUFBQSxNQUNELE9BQU8sU0FBUyxVQUFVLHdCQUF3QjtBQUFBLE1BQ2xELGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFVBQ04sbUJBQW1CO0FBQUEsVUFDbkIsc0JBQXNCO0FBQUEsVUFDdEIscUJBQXFCO0FBQUEsUUFDdkI7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELE9BQU87QUFBQSxNQUNQLGNBQWM7QUFBQSxNQUNkLHFCQUFxQjtBQUFBO0FBQUEsTUFFckI7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFVBQVUsTUFBTSxJQUFJO0FBRWxCLGNBQUksR0FBRyxTQUFTLHdEQUF3RCxHQUFHO0FBRXpFLG1CQUFPLEtBQUs7QUFBQSxjQUNWO0FBQUEsY0FDQTtBQUFBLFlBQ0Y7QUFDQSxtQkFBTyxLQUFLO0FBQUEsY0FDVjtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQ0EsbUJBQU8sRUFBRSxNQUFNLEtBQUssS0FBSztBQUFBLFVBQzNCO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBO0FBQUEsSUFFRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLHlCQUF5QixNQUFNO0FBQUEsTUFDekMsU0FBUyxDQUFDLGVBQWUsYUFBYSxpQkFBaUI7QUFBQSxJQUN6RDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSVY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0Y7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLFlBQVksQ0FBQyxXQUFXLFFBQVE7QUFBQSxRQUNoQyxPQUFPO0FBQUEsVUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsVUFDcEMsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLFFBQ3RDO0FBQUEsTUFDRjtBQUFBLElBRUY7QUFBQSxJQUNBLFdBQVUsQ0FBQyxTQUFRLG9CQUFtQixxQkFBcUI7QUFBQSxJQUMzRCxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixLQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFFRCxTQUFTLHVCQUF1QjtBQUM5QixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixnQkFBZ0IsUUFBdUI7QUFDckMsYUFBTyxZQUFZLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztBQUN6QyxjQUFNLE1BQU0sSUFBSSxRQUFRLFlBQVksR0FBRyxNQUFNLDBCQUEwQjtBQUV2RSxZQUFJLEtBQUs7QUFDUCxnQkFBTSxVQUFVLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUVuQyxjQUFJLFlBQVksS0FBSztBQUNuQixnQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLGdCQUFJO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFFQTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsYUFBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
