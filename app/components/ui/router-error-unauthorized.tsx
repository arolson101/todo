import { ErrorRouteComponent, useNavigate } from '@tanstack/react-router'
import { Button } from './button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

export const RouterErrorUnauthorized: ErrorRouteComponent = () => {
  const nav = useNavigate()

  function onSignIn() {
    nav({ to: '/signin' })
  }

  return (
    <div className='m-auto mt-24'>
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>You must be signed in to view this page</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onSignIn} className='w-full'>
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
