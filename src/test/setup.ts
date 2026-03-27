import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

const storageStore = new Map<string, string>()
const localStorageMock = {
  getItem: (key: string) => storageStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageStore.set(key, value)
  },
  removeItem: (key: string) => {
    storageStore.delete(key)
  },
  clear: () => {
    storageStore.clear()
  },
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
})

Object.defineProperty(window, "localStorage", {
  writable: true,
  value: localStorageMock,
})

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  value: () => {},
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
