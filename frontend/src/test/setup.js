import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

const createStorage = () => {
  let store = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorage(),
  configurable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: createStorage(),
  configurable: true,
});

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
  globalThis.sessionStorage?.clear();
});
