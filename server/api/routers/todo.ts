import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { TodoId } from '~server/db/ids'
import * as schema from '~server/db/schema'
import { Todo, TodoValues } from '~server/db/types'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
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
      return observable<number>((emit) => {
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
          where: (todo, { eq }) =>
            and(
              eq(todo.userId, ctx.session.user.id), //
              eq(todo.deleted, false),
            ),
        })
      return todos
    }),

  create: protectedProcedure //
    .input(TodoValues.omit({ deleted: true }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .insert(schema.todos) //
        .values({ ...input, userId: ctx.session.user.id })
    }),

  setCompleted: protectedProcedure //
    .input(z.object({ id: TodoId, completed: z.boolean() }))
    .mutation(async ({ input: { id, completed }, ctx }) => {
      await ctx.db
        .update(schema.todos) //
        .set({ completed })
        .where(
          and(
            eq(schema.todos.id, id), //
            eq(schema.todos.userId, ctx.session.user.id),
          ),
        )
    }),

  remove: protectedProcedure //
    .input(TodoId)
    .mutation(async ({ input: id, ctx }) => {
      await ctx.db
        .update(schema.todos) //
        .set({ deleted: true })
        .where(
          and(
            eq(schema.todos.id, id), //
            eq(schema.todos.userId, ctx.session.user.id),
          ),
        )
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
