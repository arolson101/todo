import * as native from './auth-provider.native'
import * as web from './auth-provider.web'

declare var _test: typeof native
declare var _test: typeof web

/// export to get the shape of the module
export * from './auth-provider.web'
