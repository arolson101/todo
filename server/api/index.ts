import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { Get, UniversalHandler } from '@universal-middleware/core'
import { db } from '~server/db/db'
import { trpcEndpoint } from '~shared/identity'
import { changeRouter } from './routers/changeRouter'
import { createCallerFactory, createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  changes: changeRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)

export const trpcHandler = ((endpoint) => (request, context, runtime) => {
  return fetchRequestHandler({
    endpoint,
    req: request,
    router: appRouter,
    createContext({ req, resHeaders }) {
      return {
        session: undefined, // session is in context
        ...context,
        ...runtime,
        req,
        resHeaders,
        db,
      }
    },
  })
}) satisfies Get<[endpoint: string], UniversalHandler>
