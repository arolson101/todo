import { Hono } from 'hono'
import { postsRoute } from './posts'

export const apiRoute = new Hono() //
  .route('/posts', postsRoute)
