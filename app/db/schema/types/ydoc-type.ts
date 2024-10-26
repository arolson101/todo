import { customType } from 'drizzle-orm/sqlite-core'
import * as Y from 'yjs'

export const ydoc = customType<{
  data: Y.Doc
  driverData: Uint8Array
}>({
  dataType() {
    return 'blob'
  },
  toDriver(value: Y.Doc): Uint8Array {
    const update = Y.encodeStateAsUpdateV2(value)
    return update
  },
  fromDriver(value: Uint8Array): Y.Doc {
    const ydoc = new Y.Doc()
    Y.applyUpdateV2(ydoc, value)
    return ydoc
  },
})
