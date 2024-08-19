import { Hono } from 'hono'
import { postsRoute } from './posts'

export const apiRoute = new Hono()
apiRoute.route('/posts', postsRoute)
