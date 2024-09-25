import { assert, type Equals } from 'tsafe'
import type * as native from './auth-provider.native'
import type * as web from './auth-provider.web'

assert<Equals<typeof native, typeof web>>()

/// export to get the shape of the module
export * from './auth-provider.web'
