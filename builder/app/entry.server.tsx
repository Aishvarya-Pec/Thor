import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import pkg from 'react-dom/server';
const { renderToReadableStream } = pkg;
import { stripIndents } from './utils/stripIndent';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {

  const theme = 'dark';

  const readable = await renderToReadableStream(<RemixServer context={{ ...remixContext, theme }} url={request.url} />, {
      signal: request.signal,
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  responseHeaders.set('Set-Cookie', `thor_theme=dark; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`);

  return new Response(readable, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
