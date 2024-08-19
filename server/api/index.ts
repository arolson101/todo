import { Hono } from 'hono'
import { todosRoute } from './todos'

export const apiRoute = new Hono() //
  .route('/todos', todosRoute)
