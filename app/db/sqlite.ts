import { assert, type Equals } from 'tsafe'
import type * as native from './sqlite.native'
import type * as web from './sqlite.web'

assert<Equals<typeof native, typeof web>>()

/// export to get the shape of the module
export * from './sqlite.web'
