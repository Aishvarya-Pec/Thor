import type { AppLoadContext } from "@remix-run/cloudflare";
import {
  createCookieSessionStorage,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "../build/server";

interface Env {
  KV_NAMESPACE: KVNamespace;
  R2_BUCKET: R2Bucket;
  D1_DATABASE: D1Database;
  OPENAI_LIKE_API_BASE_URL: string;
  OPENAI_LIKE_API_KEY: string;
  OLLAMA_API_BASE_URL: string;
  SESSION_SECRET: string;
}

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext(context) {
    const sessionStorage = createWorkersKVSessionStorage({
      kv: context.env.KV_NAMESPACE,
      cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [context.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production",
      },
    });

    return {
      cloudflare: context.env,
      sessionStorage,
      async getSession() {
        const cookie = context.request.headers.get("Cookie");
        return sessionStorage.getSession(cookie);
      },
    };
  },
});