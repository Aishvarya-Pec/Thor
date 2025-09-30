import type { EntryContext } from "@remix-run/cloudflare";

declare module "@remix-run/cloudflare" {
  interface EntryContext {
    theme?: string;
  }
}