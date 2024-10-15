import { Hono } from 'hono'
import changes from './changes'

const app = new Hono() //
  .route('/changes', changes)

export default app
