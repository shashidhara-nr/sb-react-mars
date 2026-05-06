import '@testing-library/jest-dom'
import React from 'react'

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

globalThis.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  scrollMargin = ''
  thresholds = []
  
  disconnect() {
    // Mock implementation
  }
  observe() {
    // Mock implementation
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve() {
    // Mock implementation
  }
} as any

globalThis.ResizeObserver = class ResizeObserver {
  disconnect() {
    // Mock implementation
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
}

jest.mock('@lib/icons', () => ({
  FunnelIcon: '/icons/funnel.svg',
  SearchIcon: '/icons/search.svg',
  AddIcon: '/icons/add.svg',
  Exclamation: '/icons/exclamation.svg',
  ListIcon: '/icons/list.svg',
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(),
  useMessages: jest.fn(),
  useFormatter: jest.fn(),
  useNow: jest.fn(),
  useTimeZone: jest.fn(),
}))

jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn(() => async () => ({
    messages: {},
    locale: 'en',
  })),
  getTranslations: jest.fn(() => (key: string) => key),
  getLocale: jest.fn(() => 'en'),
  getMessages: jest.fn(() => ({})),
  getNow: jest.fn(() => new Date()),
  getTimeZone: jest.fn(() => 'UTC'),
  setRequestLocale: jest.fn(),
  getExtracted: jest.fn(() => ({})),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', { ...props, alt: props.alt || 'mock-image' })
  },
}))
