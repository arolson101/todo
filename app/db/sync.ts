import { Dexie } from 'dexie'
import { IDatabaseChange } from 'dexie-observable/api'
import 'dexie-syncable'
import type { IPersistedContext, ISyncProtocol } from 'dexie-syncable/api'
import { nanoid } from 'nanoid'
import SuperJSON from 'superjson'
import { client } from '~/lib/trpc'
import type { ChangeId, SourceId } from '~server/db/ids'

export const protocolName = 'trpc'

async function sendChanges(sourceId: SourceId, changes: IDatabaseChange[], onChangesAccepted: () => any) {
  console.log('sendChanges', { changes })
  if (changes.length > 0) {
    const stringChanges = changes.map((change) => SuperJSON.stringify(change))
    await client.changes.send.query({ sourceId, changes: stringChanges })
  }
  onChangesAccepted()
}

type SyncContext = IPersistedContext & {
  sourceId?: SourceId
}

const syncProtocol: ISyncProtocol = {
  async sync(
    context: SyncContext,
    url,
    _options,
    baseRevision: ChangeId | null,
    syncedRevision: ChangeId | null,
    changes,
    partial,
    applyRemoteChanges,
    onChangesAccepted,
    onSuccess,
    onError,
  ) {
    if (!context.sourceId) {
      context.sourceId = nanoid() as unknown as SourceId
      context.save()
    }
    const { sourceId } = context

    console.log('sync', { context, url, baseRevision, syncedRevision, changes, partial })

    // send remote changes
    await sendChanges(sourceId, changes, onChangesAccepted)

    // const { unsubscribe } = client.changes.streamChanges.subscribe(syncedRevision, {
    //   onData(remoteChanges) {
    //     const changes = remoteChanges.map((rc) => SuperJSON.parse<IDatabaseChange>(rc.change))
    //     const lastRevision = Math.max(...remoteChanges.map((rc) => rc.changeId))
    //     const partial = false
    //     const clear = undefined
    //     console.log('applyRemoteChanges', { changes, lastRevision, partial, clear })
    //     applyRemoteChanges(changes, lastRevision, partial, clear)
    //   },
    //   onError(error: unknown) {
    //     console.log('onError', { error })
    //     onError(error, undefined)
    //   },
    // })

    const remoteChanges = await client.changes.streamChanges.query({
      changeId: syncedRevision,
      sourceId,
    })
    {
      const changes = remoteChanges.map((rc) => SuperJSON.parse<IDatabaseChange>(rc.change))
      const lastRevision = Math.max(...remoteChanges.map((rc) => rc.changeId))
      const partial = false
      const clear = undefined
      console.log('applyRemoteChanges', { changes, lastRevision, partial, clear })
      applyRemoteChanges(changes, lastRevision, partial, clear)
    }

    onSuccess({ again: 60 * 1000 })
    // onSuccess({
    //   async react(changes, _baseRevision, _partial, onChangesAccepted) {
    //     console.log('react', { changes, _baseRevision, _partial })
    //     await sendChanges(context.sourceId, changes, onChangesAccepted)
    //   },
    //   disconnect() {
    //     console.log('disconnect')
    //     unsubscribe()
    //   },
    // })
  },
}

Dexie.Syncable.registerSyncProtocol(protocolName, syncProtocol)
