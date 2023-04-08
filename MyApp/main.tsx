import {NavigationContainer} from '@react-navigation/native';
import App from './App';
import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';

import {Provider as PaperProvider} from 'react-native-paper';
import {TicketsProvider} from './src/context/contextUser';

const queryClient = new QueryClient();

export default function Index() {
  return (
    <TicketsProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </TicketsProvider>
  );
}
