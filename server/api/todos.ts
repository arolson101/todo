import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

export const TodoId = z.string().trim().min(1).max(64).brand('todo_id')
export type TodoId = z.infer<typeof TodoId>

export const Todo = z.object({
  id: TodoId,
  text: z.string().trim().min(3).max(100),
  completed: z.boolean().optional().default(false),
})
export type Todo = z.infer<typeof Todo>

const makeId = (n: number): TodoId => TodoId.parse(`${n}`)

const todos: Todo[] = [
  {
    id: makeId(1),
    text: 'First Todo',
    completed: false,
  },
  {
    id: makeId(2),
    text: 'Second Todo',
    completed: false,
  },
]

const createPostSchema = Todo.omit({ id: true })

export const postsRoute = new Hono()
  .get('/', (c) => {
    return c.json({ posts: todos })
  })
  .post('/', zValidator('json', createPostSchema), (c) => {
    const post = c.req.valid('json')
    todos.push({ ...post, id: makeId(todos.length + 1) })
    c.status(201)
    return c.json({ post: todos[todos.length - 1] })
  })
  .get('/:id', (c) => {
    const id = c.req.param('id')
    const post = todos.find((p) => p.id === id)
    if (!post) {
      return c.notFound()
    }
    return c.json({ post })
  })
