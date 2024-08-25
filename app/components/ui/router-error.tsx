import { ErrorRouteComponent, useNavigate } from '@tanstack/react-router'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { RouterErrorUnauthorized } from './router-error-unauthorized'

export const RouterError: ErrorRouteComponent = ({ error, reset, info }) => {
  const nav = useNavigate()

  function onGoHome() {
    reset?.()
    nav({ to: '/' })
  }

  if (error.message === 'UNAUTHORIZED') {
    return <RouterErrorUnauthorized error={error} reset={reset} info={info} />
  }

  return (
    <div className='m-auto mt-24'>
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription className='text-destructive'>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          {error.stack && <CardDescription className='block whitespace-pre text-sm'>{error.stack}</CardDescription>}
          {info && <pre>{info.componentStack}</pre>}
        </CardContent>
        <CardFooter>
          <Button onClick={onGoHome}>Go Home</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
