import { hc } from 'hono/client'
import type { ApiRoutes } from '@server/app'

const client = hc<ApiRoutes>('/', {
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = client.api
