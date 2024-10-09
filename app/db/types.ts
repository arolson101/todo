import { TodoId } from '~/db/ids'

export type TodoInput = {
  completed: boolean
  title: string
}

export type Todo = TodoInput & {
  id: TodoId
  deleted: 0 | 1
}
