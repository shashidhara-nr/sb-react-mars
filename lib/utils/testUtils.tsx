import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

/**
 * Test Utilities for Redux-Connected Components
 * 
 * Use these utilities to create mock stores and render components with Redux context
 */

/**
 * Creates a mock Redux store for testing
 * @param preloadedState - Initial state for the store
 * @param reducers - Object containing reducers to include
 * @returns Configured mock store
 */
export function createMockStore(preloadedState = {}, reducers = {}) {
  return configureStore({
    reducer: reducers,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

/**
 * Renders a component with Redux Provider
 * @param ui - Component to render
 * @param options - Render options including store and initial state
 * @returns Render result
 */
export function renderWithRedux(
  ui: React.ReactElement,
  {
    preloadedState = {},
    reducers = {},
    store = createMockStore(preloadedState, reducers),
    ...renderOptions
  }: any = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

/**
 * Example usage:
 * 
 * import { renderWithRedux, createMockStore } from '@/test-utils/reduxTestUtils'
 * import myReducer from '@store/slices/mySlice'
 * 
 * it('renders with redux state', () => {
 *   const store = createMockStore(
 *     { mySlice: { value: 'test' } },
 *     { mySlice: myReducer }
 *   )
 *   
 *   renderWithRedux(<MyComponent />, { store })
 *   
 *   expect(screen.getByText('test')).toBeInTheDocument()
 * })
 */
