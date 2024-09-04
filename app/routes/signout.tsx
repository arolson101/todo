import { signOut, useSession } from 'next-auth/react'
import { AppLogo } from '~/components/ui/app-logo'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { makeRoute, useNavigate } from '~/lib/router'
import { api } from '~/lib/trpc'

const route = makeRoute({
  path: '/signout',
  Component: SignOutPage,
})

function SignOutPage() {
  const nav = useNavigate()
  const utils = api.useUtils()

  function onGoHome() {
    nav('/')
  }

  async function onSignOut() {
    await signOut({ redirect: false })
    utils.invalidate()
    nav('/')
  }

  const { status } = useSession()
  const signedIn = status === 'authenticated'

  return (
    <div className='m-auto mt-24 w-full max-w-[400px]'>
      <Card className='m-auto'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>
            <AppLogo width={300} className='m-auto w-52 p-8' />
            Sign Out
          </CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4'>
          <CardDescription>{signedIn ? 'Are you sure you want to sign out?' : 'You are not signed in'}</CardDescription>
        </CardContent>

        <CardFooter>
          {signedIn ? (
            <Button variant='destructive' onPress={onSignOut} className='w-full'>
              Sign Out
            </Button>
          ) : (
            <Button onPress={onGoHome} className='w-full'>
              Go Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default route
