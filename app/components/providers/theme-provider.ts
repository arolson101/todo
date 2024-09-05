import * as web from './theme-provider.web'
import * as native from './theme-provider.native'

declare var _test: typeof native
declare var _test: typeof web

/// export to get the shape of the module
export * from './theme-provider.web'
