import * as native from './sqlite.native'
import * as web from './sqlite.web'

declare var _test: typeof native
declare var _test: typeof web

/// export to get the shape of the module
export * from './sqlite.web'
