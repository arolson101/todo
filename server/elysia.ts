import { trpc } from '@elysiajs/trpc'
import { Elysia } from 'elysia'
import { vite } from 'elysia-vite-server'
import { appRouter } from './api'

const app = new Elysia()
  .use(
    vite({
      static: {
        assets: '.',
        alwaysStatic: false,
        noCache: true,
      },
    }),
  )
  .use(trpc(appRouter))
  .listen(3000, (x) => console.log(`elysia running at ${x.url}`))
