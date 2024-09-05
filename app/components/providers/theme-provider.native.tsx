import type { ThemeProviderProps } from './theme-provider.web'

export type { ThemeProviderProps }

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
