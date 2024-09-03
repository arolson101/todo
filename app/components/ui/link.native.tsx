import { Link as NativeLink } from '@react-navigation/native'
import { cn } from '~/lib/utils'

export function Link({ children, className, ...props }: React.PropsWithChildren<{ to: string; className?: string }>) {
  return (
    <NativeLink className={cn('text-primary/70 hover:text-primary', className)} {...props}>
      {children}
    </NativeLink>
  )
}
