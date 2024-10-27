import { useY } from 'react-yjs'
import * as Y from 'yjs'

export type YProxy<T> = {
  useValues(): T
}

export function yproxy<T>(obj: Partial<T>, keys: Array<keyof T & string>, ymap: Y.Map<any>): T & YProxy<T> {
  const ret = {
    ...obj,
    useValues() {
      useY(ymap)
      return ret
    },
  } as T & YProxy<T>

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
  return ret as T & YProxy<T>
}
