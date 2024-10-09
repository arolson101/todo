import Dexie, { type EntityTable } from 'dexie'
import { Todo } from '~/db/types'
import { browserDbName } from '~shared/identity'
import { protocolName } from './sync'

class AppDB extends Dexie {
  todos!: EntityTable<Todo, 'id'>

  constructor() {
    super(browserDbName)
    this.version(1).stores({
      todos: 'id, deleted, title',
    })
  }
}

export const db = new AppDB()
db.syncable.connect(protocolName, '/sync')
