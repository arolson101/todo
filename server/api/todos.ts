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

const createTodoSchema = Todo.omit({ id: true })

export const todosRoute = new Hono()
  .get('/', (c) => {
    return c.json({ todos })
  })
  .post('/', zValidator('json', createTodoSchema), (c) => {
    const todo = c.req.valid('json')
    todos.push({ ...todo, id: makeId(todos.length + 1) })
    c.status(201)
    return c.json({ todo: todos[todos.length - 1] })
  })
  .get('/:id', (c) => {
    const id = c.req.param('id')
    const todo = todos.find((p) => p.id === id)
    if (!todo) {
      return c.notFound()
    }
    return c.json({ todo })
  })
