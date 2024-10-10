import FastifyVite from '@fastify/vite'
import ws from '@fastify/websocket'
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import { createHandler, createMiddleware } from '@universal-middleware/fastify'
import fastify from 'fastify'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { appRouter, type AppRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { authConfig, authjsHandler, authjsSessionMiddleware } from './auth/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = dirname(__dirname)
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const hmrPort = process.env.HMR_PORT ? parseInt(process.env.HMR_PORT, 10) : 24678

const app = fastify({
  logger: true,
  maxParamLength: 5000,
})

// Avoid pre-parsing body, otherwise it will cause issue with universal handlers
// This will probably change in the future though, you can follow https://github.com/magne4000/universal-middleware for updates
app.removeAllContentTypeParsers()
app.addContentTypeParser('*', function (_request, _payload, done) {
  done(null, '')
})

await app.register(await import('@fastify/middie'))

if (process.env.NODE_ENV === 'production') {
  await app.register(await import('@fastify/static'), {
    root,
    wildcard: false,
  })
} else {
  // Instantiate Vite's development server and integrate its middleware to our server.
  // ⚠️ We should instantiate it *only* in development. (It isn't needed in production
  // and would unnecessarily bloat our server in production.)
  const FastifyVite = await import('@fastify/vite')

  await app.register(FastifyVite, {
    root, // where to look for vite.config.js
    dev: true,
    spa: true,
    logLevel: 'debug'
  })

  app.get('/', (req, reply) => {
    return reply.html()
  })

  // console.log('waiting for vite')
  await app.vite.ready()
  // console.log('vite ready')
}
// await server.register(require('@fastify/express'))

// server.use('/auth/*', ExpressAuth(getAuthConfig()))

await app.register(createMiddleware(authjsSessionMiddleware)())

/**
 * Auth.js route
 * @link {@see https://authjs.dev/getting-started/installation}
 **/
app.all('/api/auth/*', createHandler(authjsHandler)())

await app.register(ws)

await app.register(fastifyTRPCPlugin, {
  prefix: '/api/trpc',
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 30000,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5000,
  },
  useWSS: true,
  trpcOptions: {
    router: appRouter,
    createContext: createTRPCContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
})

await app.listen({ port: port })
console.log(`Server listening on http://localhost:${port}`)
