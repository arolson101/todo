import middie from '@fastify/middie'
import fastify from 'fastify'
import { createServer as createViteServer } from 'vite'

// ...

const app = fastify({  })

await app.register(middie)

// Create Vite server in middleware mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  // appType: 'custom', // don't include Vite's default HTML handling middlewares
})
app.use(vite.middlewares)
app.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
