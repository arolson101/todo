import { Hono } from 'hono'
import { postsRoute as todosRoute } from './todos'

export const apiRoute = new Hono() //
  .route('/todos', todosRoute)
