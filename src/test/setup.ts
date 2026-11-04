/// <reference types="vitest/jsdom" />
import "@testing-library/jest-dom";

// Node 25+ defines its own global `localStorage`, which is undefined unless Node runs with
// --localstorage-file. Vitest won't replace globals Node already has, so use jsdom's Storage.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: jsdom.window.localStorage,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
