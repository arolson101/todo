import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { TodoId } from '~server/db/ids'
import { Todo } from '~server/db/types'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

function delay(t: number) {
  return new Promise(resolve => setTimeout(resolve, t))
}

export const todoRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    }
  }),

  randomNumber: publicProcedure //
    .subscription(() => {
      let i = 0
      return observable<number>(emit => {
        const int = setInterval(() => {
          i++
          console.log('randomNumber', i)
          emit.next(Math.random())
        }, 1000)
        return () => {
          console.log('unsubscribe')
          clearInterval(int)
        }
      })
    }),

  stream: publicProcedure //
    .subscription(async function* (opts) {
      let i = 0
      let aborted = false
      while (!opts.ctx.c.req.raw.signal.aborted) {
        i++
        console.log('stream', i)
        yield i
        await delay(1000)
      }
      console.log('finalized')
    }),

  getSecretMessage: protectedProcedure //
    .query(() => {
      return 'you can now see this secret message!'
    }),

  all: protectedProcedure //
    .input(z.void())
    .output(z.array(Todo))
    .query(async ({ ctx }) => {
      const todos = await ctx.db.query.todos //
        .findMany({
          where: (todo, { eq }) => eq(todo.userId, ctx.session.user.id),
        })
      return todos
    }),

  getTodo: protectedProcedure //
    .input(z.object({ id: TodoId }))
    .output(Todo)
    .query(async ({ ctx, input: { id } }) => {
      const todo = await ctx.db.query.todos.findFirst({
        where: (todos, { eq }) => eq(todos.id, id),
      })
      if (!todo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return todo
    }),
})
