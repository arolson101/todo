import * as web from './window.web'
import * as windows from './window.windows'

declare var _test: typeof web
declare var _test: typeof windows

/// export to get the shape of the module
export * from './window.web'
