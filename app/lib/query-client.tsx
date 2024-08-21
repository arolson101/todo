import { defaultShouldDehydrateQuery, EnsureQueryDataOptions, QueryClient, QueryKey } from '@tanstack/react-query'
import SuperJSON from 'superjson'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  })

let clientQueryClientSingleton: QueryClient | undefined = undefined
export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient())
}

export const queryLoader =
  <TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
    options: EnsureQueryDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  ) =>
  () => {
    const queryClient = getQueryClient()
    return queryClient.ensureQueryData(options)
  }