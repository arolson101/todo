import { tracked } from '@trpc/server'
import EventEmitter, { on } from 'events'
import { filter, Subject } from 'rxjs'
import { bufferedValuesFrom } from 'rxjs-for-await'
import { z } from 'zod'
import { SourceId, UserId } from '~server/db/ids'
import * as schema from '~server/db/schema'
import { ChangeValues } from '~server/db/types'
import { zAsyncGenerator } from '~server/util/zAsyncGenerator'
import { ChangeId, ChangeSchema } from '~shared/models/change'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

type ChangeEvent = {
  userId: UserId
  sourceId: SourceId
  changeId: ChangeId
  changes: ChangeSchema[]
}

const change$ = new Subject<ChangeEvent>()

function delay(t: number) {
  return new Promise(resolve => setTimeout(resolve, t))
}

export const changeRouter = createTRPCRouter({
  stream: publicProcedure //
    .subscription(async function* (opts) {
      let i = 0
      while (!opts.ctx.c.req.raw.signal.aborted) {
        i++
        console.log('stream', i)
        yield i
        await delay(1000)
      }
      console.log('finalized')
    }),

  send: protectedProcedure //
    .input(z.object({ changes: z.array(ChangeSchema), sourceId: SourceId }))
    .output(z.boolean())
    .mutation(async ({ input: { sourceId, changes }, ctx }) => {
      if (changes.length > 0) {
        const userId = UserId.parse(ctx.session.user.id)
        const values = changes.map(change => ({
          ...change,
          sourceId,
          userId,
        })) satisfies Array<ChangeValues>

        const ret = await ctx.db //
          .insert(schema.changes)
          .values(values)
          .returning({ changeId: schema.changes.changeId })

        const changeId = ChangeId.parse(Math.max(...ret.map(c => c.changeId)))
        change$.next({ userId, sourceId, changeId, changes })
      }
      return true
    }),

  streamChanges: protectedProcedure //
    .input(
      z.object({
        sourceId: SourceId, //
        lastEventId: ChangeId.nullish(),
      }),
    )
    .output(
      zAsyncGenerator({
        yield: z.array(ChangeSchema),
        tracked: true,
      }),
    )
    .subscription(async function* ({ input: { sourceId, lastEventId }, ctx }) {
      const userId = ctx.session.user.id

      console.log('subscription called', { userId, sourceId, lastEventId })
      const changeStream = bufferedValuesFrom(
        change$.pipe(
          filter(c => c.userId === userId && c.sourceId !== sourceId), //
        ),
      )

      lastEventId ??= ChangeId.parse(0)
      const changes = await ctx.db.query.changes //
        .findMany({
          where: (change, { eq, and, gt, ne }) =>
            and(
              eq(change.userId, userId), //
              gt(change.changeId, +lastEventId),
              ne(change.sourceId, sourceId),
            ),
          columns: { changeId: true, docType: true, docId: true, update: true },
        })

      if (changes.length > 0) {
        const changeId = Math.max(...changes.map(c => c.changeId))
        yield tracked(changeId.toString(), changes)
      }

      for await (const buffered of changeStream) {
        const changes = buffered.flatMap(b => b.changes)
        const changeId = Math.max(...buffered.map(b => b.changeId))
        // tracking the post id ensures the client can reconnect at any time and get the latest events this id
        yield tracked(changeId.toString(), changes)
      }
    }),
})
