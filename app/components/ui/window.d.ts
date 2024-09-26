import type * as native from './window.native'
import type * as web from './window.web'
import type * as windows from './window.windows'

declare var _test: typeof native
declare var _test: typeof web
declare var _test: typeof windows

/// export to get the shape of the module
export * from './window.web'
