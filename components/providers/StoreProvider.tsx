'use client';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from 'store/index';
import { initializeHttpClient } from 'lib/api/httpClient';

export default function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Set Redux store reference for HTTP client (for logout on 401)
    // Note: Interceptors are already set up at module load time
    initializeHttpClient(store);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
