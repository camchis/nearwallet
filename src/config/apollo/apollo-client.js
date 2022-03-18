import { ApolloClient, ApolloLink } from '@apollo/client';
import { errorLink } from './error-link';
import { createHttpLink } from './http-link';
import { localCache } from './local-cache';

export function createApolloClient() {
  const httpLink = createHttpLink();

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    connectToDevTools: process.env.NODE_ENV !== 'production',
    cache: localCache,
    assumeImmutableResults: true,
  });

  return apolloClient;
}
