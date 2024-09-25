import { assert, type Equals } from 'tsafe'
import type * as native from './window.native'
import type * as web from './window.web'
import type * as windows from './window.windows'

assert<Equals<typeof native, typeof web>>()
assert<Equals<typeof native, typeof windows>>()

/// export to get the shape of the module
export * from './window.web'
