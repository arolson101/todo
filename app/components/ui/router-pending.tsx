import { Spinner } from '~/components/ui/spinner'
import { Card, CardContent } from './card'

export const RouterPending = () => (
  <div className='m-auto'>
    <Card>
      <CardContent>
        <Spinner className='m-10' size='large' />
        <p className='m-auto w-max'>Loading</p>
      </CardContent>
    </Card>
  </div>
)
