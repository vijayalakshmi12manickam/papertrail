import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// staleTime is set generously by default here; individual hooks (Step 2) override
// per-collection based on how often that data actually changes. This is the main
// lever for staying under the Firestore free-tier read quota — cached data is
// served from memory/AsyncStorage without hitting the network or counting as a read.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Persists the React Query cache to AsyncStorage so reference data (categories,
// accounts, currencies) that has already loaded once survives an app restart
// while offline — Firestore's own offline cache only helps once the JS process
// (and this in-memory query cache) is already alive.
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'papertrail:reactQueryCache',
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            ['categories', 'accounts', 'currencies'].includes(query.queryKey[0]),
        },
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
