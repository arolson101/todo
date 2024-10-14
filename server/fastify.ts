// await app.register(ws)
import { fastifyStatic } from '@fastify/static'
import {
  type CreateFastifyContextOptions,
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'
import { createHandler, createMiddleware } from '@universal-middleware/fastify'
import fastify from 'fastify'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '~server/env'
import { authEndpoint, trpcEndpoint } from '~shared/identity'
import { appRouter, type AppRouter, trpcHandler } from './api'
import { authjsHandler, authjsSessionMiddleware } from './auth/config'
import { db } from './db/db'
import { vikeHandler } from './vike-handler'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

async function startServer() {
  const app = fastify({
    disableRequestLogging: true,
    logger: {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
      },
    },
    maxParamLength: 5000,
  })

  // Avoid pre-parsing body, otherwise it will cause issue with universal handlers
  // This will probably change in the future though, you can follow https://github.com/magne4000/universal-middleware for updates
  app.removeAllContentTypeParsers()
  app.addContentTypeParser('*', function (_request, _payload, done) {
    done(null, '')
  })

  await app.register(await import('@fastify/middie'))

  await app.register(createMiddleware(authjsSessionMiddleware)(authEndpoint))

  if (env.NODE_ENV === 'production') {
    await app.register(await import('@fastify/static'), {
      root: `${__dirname}/public`,
      wildcard: false,
    })
  } else {
    // Instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We should instantiate it *only* in development. (It isn't needed in production
    // and would unnecessarily bloat our server in production.)
    const vite = await import('vite')
    const proxy = undefined // { '/api': {} }
    const viteServer = await vite.createServer({
      root: dirname(__dirname),
      server: { middlewareMode: true, proxy },
      preview: { proxy },
    })
    app.use(viteServer.middlewares)
  }

  app.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: {
      router: appRouter,
      createContext({ req, res, info }) {
        return {
          session: undefined, // session is in context
          req,
          db,
        }
      },
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error)
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  })

  // app.get('*', (req, reply) => {
  //   return reply.html()
  // })

  // await app.register(fastifyStatic, {
  //   root: join(__dirname, 'public'),
  // })

  // app.all('/*', createHandler(vikeHandler)())

  return app
}

const app = await startServer()

app.listen({ port }, (err, addr) => (err ? console.error(err) : console.log(`listening on ${addr}`)))
