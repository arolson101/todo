import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

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

export const todoRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    }
  }),

  getSecretMessage: protectedProcedure //
    .query(() => {
      return 'you can now see this secret message!'
    }),

  all: publicProcedure //
    .input(z.void())
    .output(z.array(Todo))
    .query(() => {
      return todos
    }),

  getTodo: publicProcedure //
    .input(z.object({ id: TodoId }))
    .output(Todo)
    .query(({ input: { id } }) => {
      const todo = todos.find((p) => p.id === id)
      if (!todo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return todo
    }),
})
