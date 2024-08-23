import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { getQueryClient } from '~/lib/query-client'
import { api } from '~/lib/trpc'
import { getTrpcLinks } from '~/lib/trpc'

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    api.createClient({
      links: getTrpcLinks(),
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  )
}
