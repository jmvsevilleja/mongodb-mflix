"use client";

import {
  ApolloClient,
  FetchResult,
  InMemoryCache,
  Observable,
  ApolloProvider as Provider,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ErrorResponse, onError } from "@apollo/client/link/error";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
});

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auth Link - Adds authorization header
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: session?.accessToken
          ? `Bearer ${session.accessToken}`
          : "",
      },
    };
  });

  // Error Link - Handles token refresh
  const errorLink = onError(
    ({
      graphQLErrors,
      networkError,
    }: ErrorResponse): Observable<FetchResult> | void => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          // Check for authentication error
          if (err.extensions?.code === "UNAUTHENTICATED" && !isRefreshing) {
            setIsRefreshing(true);

            // Return a new observable that retries the failed request
            return new Observable((observer) => {
              update() // This triggers the refresh token flow in NextAuth
                .then((updatedSession) => {
                  if (!updatedSession) {
                    router.push("/auth/signin");
                    observer.complete();
                  }
                })
                .catch(() => {
                  // If refresh fails, redirect to login
                  router.push("/auth/signin");
                  observer.complete();
                })
                .finally(() => {
                  setIsRefreshing(false);
                });
            });
          }
        }
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    }
  );

  const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
  });

  // Don't initialize Apollo Client until session is loaded
  if (status === "loading") {
    return null;
  }

  return <Provider client={client}>{children}</Provider>;
}
