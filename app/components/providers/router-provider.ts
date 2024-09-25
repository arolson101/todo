import { assert, type Equals } from 'tsafe'
import type * as native from './router-provider.native'
import type * as web from './router-provider.web'

assert<Equals<typeof native, typeof web>>()

/// export to get the shape of the module
export * from './router-provider.web'
