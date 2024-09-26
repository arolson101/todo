import type * as native from './router-provider.native'
import type * as web from './router-provider.web'

declare var _test: typeof native
declare var _test: typeof web

/// export to get the shape of the module
export * from './router-provider.web'
