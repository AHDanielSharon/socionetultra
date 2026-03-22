import { AppState } from './types';

const KEY = 'socionet_v1';

export const loadState = (): AppState | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
};

export const resetState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
};
