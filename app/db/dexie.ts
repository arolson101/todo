import Dexie, { type EntityTable } from 'dexie'
import { dbTablePrefix } from '~shared/identity'

export type Todo = {
  _id: number
  _deleted?: 0 | 1
  _guid: string
  text: string
  completed: boolean
}

export const db = new Dexie(`${dbTablePrefix}database`) as Dexie & {
  todos: EntityTable<Todo, '_id'>
}

db.version(1) //
  .stores({
    todos: '++_id, _guid, _deleted',
  })
