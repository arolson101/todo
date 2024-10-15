import { hc } from 'hono/client'
import type { AppType } from '~server/hono'

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const client = hc<AppType>(getBaseUrl())
