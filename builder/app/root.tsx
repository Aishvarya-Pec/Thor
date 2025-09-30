import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { stripIndents } from './utils/stripIndent';
// import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export async function loader({ request }: LoaderFunctionArgs) {
  const theme = 'dark';
  return json({ theme });
}

export const meta = () => {
  return [
    { title: 'THOR - AI APP BUILDER' },
    { name: 'description', content: 'Build complete applications and projects with AI assistance. From concept to deployment - your intelligent development companion.' },
  ];
};

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/thorlogo.png',
    type: 'image/png',
  },
  {
    rel: 'icon',
    href: '/favicon.ico',
    type: 'image/x-icon',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous' as const,
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>();

  useEffect(() => {
    console.log('Client-side theme:', theme);
  }, [theme]);

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorBoundary>
          <Layout>
            <Outlet />
          </Layout>
        </ErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
