import type { RouteComponent } from '@tanstack/react-router'
import { Spinner } from '~/components/ui/spinner'
import { Card, CardContent } from './card'

export const RouterPending: RouteComponent = () => (
  <div className='m-auto mt-24'>
    <Card>
      <CardContent>
        <Spinner className='m-10' size='large' />
        <p className='m-auto w-max'>Loading</p>
      </CardContent>
    </Card>
  </div>
)
