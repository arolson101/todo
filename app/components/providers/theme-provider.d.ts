import type * as native from './theme-provider.native'
import type * as web from './theme-provider.web'

declare var _test: typeof native
declare var _test: typeof web

/// export to get the shape of the module
export * from './theme-provider.web'
