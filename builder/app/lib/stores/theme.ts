import { atom } from 'nanostores';

export type Theme = 'dark';

export const kTheme = 'thor_theme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME = 'dark';

export const themeStore = atom<Theme>(initStore());

function initStore() {
  // Single-theme app: always dark
  return DEFAULT_THEME;
}

export function toggleTheme() {
  // No-op toggle: enforce dark theme
  themeStore.set('dark');
  document.querySelector('html')?.setAttribute('data-theme', 'dark');
}
