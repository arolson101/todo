import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { apiRoute } from './api'

export const app = new Hono()

app.use('*', logger())

const api = app.route('/api', apiRoute)

app.use('*', serveStatic({ root: './frontend/dist' }))
app.use('*', serveStatic({ root: './frontend/dist/index.html' }))

export type ApiRoutes = typeof api
