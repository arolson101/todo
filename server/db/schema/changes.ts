import { index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import type { ChangeId, SourceId, UserId } from '~server/db/ids'
import { _bool, _idNum, _idUUID, _int, _refidUUID, _text, _timestamp, createTable } from '~server/util/dbUtils'
import { users } from './auth'

export const changes = createTable(
  'changes',
  {
    changeId: _idNum('change_id'),
    sourceId: _text<SourceId>('source_id'),
    userId: _refidUUID<UserId>('user_id', () => users.id),
    change: _text('change'),
  },
  (t) => ({
    user: index('changes_user_id').on(t.userId),
    change: index('changes_userid_changeid_sourceid').on(t.userId, t.changeId, t.sourceId),
  }),
)

export const changesRelations = relations(changes, ({ one }) => ({
  user: one(users, {
    fields: [changes.userId],
    references: [users.id],
  }),
}))
