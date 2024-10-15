import { verifyAuth } from '@hono/auth-js'
import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { type Context, Hono } from 'hono'
import { stream, streamSSE, streamText } from 'hono/streaming'
import { z } from 'zod'
import { ChangeId, SourceId, UserId } from '~server/db/ids'
import * as schema from '~server/db/schema'
import type { ChangeValues } from '~server/db/types'

function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

async function getUserId(c: Context) {
  const auth = c.get('authUser')
  // const user = await getAuthUser(c)
  // const { session } = c.get('authUser')
  return UserId.parse(auth?.user?.id)
}

let id = 0

const app = new Hono() //
  .use('*', verifyAuth())

  .get(
    '/', //
    zValidator('param', z.object({ sourceId: SourceId, changeId: ChangeId.nullable() })),
    async (c) => {
      const userId = await getUserId(c)
      const db = c.get('db')
      let { changeId, sourceId } = c.req.valid('param')
      if (changeId === -Infinity) {
        changeId = null
      }
      return streamSSE(
        c, //
        async (stream) => {
          // while (!stream.aborted) {
          const changes = await db.query.changes //
            .findMany({
              where: (change, { eq, and, gt, ne }) =>
                and(
                  eq(change.userId, userId), //
                  gt(change.changeId, changeId ?? 0),
                  ne(change.sourceId, sourceId),
                ),
              columns: { changeId: true, change: true },
            })
          await stream.writeSSE({
            event: 'message',
            data: JSON.stringify(changes),
          })
          await stream.sleep(1000)
          // }
        },
      )
    },
  )

  .post(
    '/', //
    zValidator('json', z.object({ changes: z.array(z.string()), sourceId: SourceId })),
    async (c) => {
      const userId = await getUserId(c)
      const db = c.get('db')
      let { changes, sourceId } = c.req.valid('json')
      if (changes.length > 0) {
        const values = changes.map((change) => ({
          change,
          sourceId,
          userId,
        })) satisfies Array<ChangeValues>
        const ret = await db //
          .insert(schema.changes)
          .values(values)
      }
    },
  )

// .get(
//   '/all', //
//   async (c) => {
//     const userId = await getUserId(c)
//     const todos = await db.query.todos //
//       .findMany({
//         where: (todo, { eq }) =>
//           and(
//             eq(todo.userId, userId), //
//             eq(todo.deleted, false),
//           ),
//       })
//     return c.json(todos)
//   },
// )

// .post(
//   '/create', //
//   zValidator('json', TodoValues.omit({ deleted: true })),
//   async (c) => {
//     const userId = await getUserId(c)
//     const input = c.req.valid('json')
//     await db //
//       .insert(schema.todos)
//       .values({ ...input, userId })
//     return c.status(200)
//   },
// )

// .post(
//   '/set-completed', //
//   zValidator('json', z.object({ id: TodoId, completed: z.boolean() })),
//   async (c) => {
//     const userId = await getUserId(c)
//     const { id, completed } = c.req.valid('json')
//     await db //
//       .update(schema.todos)
//       .set({ completed })
//       .where(
//         and(
//           eq(schema.todos.id, id), //
//           eq(schema.todos.userId, userId),
//         ),
//       )
//   },
// )

// .delete(
//   '/:id', //
//   zValidator('param', z.object({ id: TodoId })),
//   async (c) => {
//     const userId = await getUserId(c)
//     const { id } = c.req.valid('param')
//     await db
//       .update(schema.todos) //
//       .set({ deleted: true })
//       .where(
//         and(
//           eq(schema.todos.id, id), //
//           eq(schema.todos.userId, userId),
//         ),
//       )
//   },
// )

export default app

// export const todoRouter = createTRPCRouter({
//   hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
//     return {
//       greeting: `Hello ${input.text}`,
//     }
//   }),

//   randomNumber: publicProcedure //
//     .subscription(() => {
//       let i = 0
//       return observable<number>((emit) => {
//         const int = setInterval(() => {
//           i++
//           console.log('randomNumber', i)
//           emit.next(Math.random())
//         }, 1000)
//         return () => {
//           console.log('unsubscribe')
//           clearInterval(int)
//         }
//       })
//     }),

//   stream: publicProcedure //
//     .subscription(async function* (opts) {
//       let i = 0
//       let aborted = false
//       while (!opts.ctx.c.req.raw.signal.aborted) {
//         i++
//         console.log('stream', i)
//         yield i
//         await delay(1000)
//       }
//       console.log('finalized')
//     }),

//   getSecretMessage: protectedProcedure //
//     .query(() => {
//       return 'you can now see this secret message!'
//     }),

//   all: protectedProcedure //
//     .input(z.void())
//     .output(z.array(Todo))
//     .query(async ({ ctx }) => {
//       const todos = await ctx.db.query.todos //
//         .findMany({
//           where: (todo, { eq }) =>
//             and(
//               eq(todo.userId, ctx.session.user.id), //
//               eq(todo.deleted, false),
//             ),
//         })
//       return todos
//     }),

//   create: protectedProcedure //
//     .input(TodoValues.omit({ deleted: true }))
//     .mutation(async ({ input, ctx }) => {
//       await ctx.db
//         .insert(schema.todos) //
//         .values({ ...input, userId: ctx.session.user.id })
//     }),

//   setCompleted: protectedProcedure //
//     .input(z.object({ id: TodoId, completed: z.boolean() }))
//     .mutation(async ({ input: { id, completed }, ctx }) => {
//       await ctx.db
//         .update(schema.todos) //
//         .set({ completed })
//         .where(
//           and(
//             eq(schema.todos.id, id), //
//             eq(schema.todos.userId, ctx.session.user.id),
//           ),
//         )
//     }),

//   remove: protectedProcedure //
//     .input(TodoId)
//     .mutation(async ({ input: id, ctx }) => {
//       await ctx.db
//         .update(schema.todos) //
//         .set({ deleted: true })
//         .where(
//           and(
//             eq(schema.todos.id, id), //
//             eq(schema.todos.userId, ctx.session.user.id),
//           ),
//         )
//     }),

//   getTodo: protectedProcedure //
//     .input(z.object({ id: TodoId }))
//     .output(Todo)
//     .query(async ({ ctx, input: { id } }) => {
//       const todo = await ctx.db.query.todos.findFirst({
//         where: (todos, { eq }) => eq(todos.id, id),
//       })
//       if (!todo) {
//         throw new TRPCError({ code: 'NOT_FOUND' })
//       }
//       return todo
//     }),
// })
