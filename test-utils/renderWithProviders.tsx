import React from 'react'
import type { EnhancedStore } from '@reduxjs/toolkit'

import { renderWithRedux } from '../lib/utils/testUtils'

export function renderWithProviders(
  ui: React.ReactElement,
  options: {
    preloadedState?: unknown
    reducers?: Record<string, unknown>
    store?: EnhancedStore
  } & Record<string, unknown> = {}
) {
  return renderWithRedux(ui, options as any)
}

export { createMockStore } from '../lib/utils/testUtils'
