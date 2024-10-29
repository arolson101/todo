import { useY } from 'react-yjs'
import * as Y from 'yjs'

export type YProxy<T> = {
  [Key in keyof T]: T[Key]
} & {
  useValues(): T
}

// TODO: the typings on this could be improved
export function yproxy<T extends {}>(
  ymap: Y.Map<any>, //
  obj: Partial<T>,
  keys: Array<keyof T & string>,
): YProxy<T> {
  const ret = {
    ...obj,
    useValues() {
      useY(ymap)
      return ret
    },
  } as YProxy<T>

  for (const key of keys) {
    Object.defineProperty(ret, key, {
      get() {
        return ymap.get(key)
      },
      set(value) {
        ymap.set(key, value)
      },
      enumerable: true,
    })
  }
  return ret
}
