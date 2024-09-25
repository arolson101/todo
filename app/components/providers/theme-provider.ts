import { assert, type Equals } from 'tsafe'
import type * as native from './theme-provider.native'
import type * as web from './theme-provider.web'

assert<Equals<typeof native, typeof web>>()

/// export to get the shape of the module
export * from './theme-provider.web'
