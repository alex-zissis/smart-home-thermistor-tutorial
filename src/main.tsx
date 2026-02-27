import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router';
import AppShell from './AppShell';
import GuidePage from './pages/GuidePage';
import ConfigPage from './pages/ConfigPage';
import MathPage from './pages/MathPage';
import TroubleshootingPage from './pages/TroubleshootingPage';
import './styles.css';

function resolveBasepath(): string {
  const configuredBase = import.meta.env.BASE_URL;
  if (configuredBase && configuredBase !== '/' && configuredBase !== './') {
    return configuredBase.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    const firstPathSegment = window.location.pathname.split('/').filter(Boolean)[0];
    if (firstPathSegment) {
      return `/${firstPathSegment}`;
    }
  }

  return '/';
}

const rootRoute = createRootRoute({
  component: AppShell
});

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GuidePage
});

const configRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'config',
  component: ConfigPage
});

const mathRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'math',
  component: MathPage
});

const troubleshootingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'troubleshooting',
  component: TroubleshootingPage
});

const routeTree = rootRoute.addChildren([
  guideRoute,
  configRoute,
  mathRoute,
  troubleshootingRoute
]);

const router = createRouter({
  routeTree,
  basepath: resolveBasepath()
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
