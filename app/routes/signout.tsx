import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { signOut, useSession } from 'next-auth/react'
import { PageHeader } from '~/components/page-header'
import { AppLogo } from '~/components/ui/app-logo'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
})

function SignOutPage() {
  const nav = useNavigate()

  function onGoHome() {
    nav({ to: '/' })
  }

  async function onSignOut() {
    await signOut({ redirect: false })
    nav({ to: '/' })
  }

  const { status } = useSession()
  const signedIn = status === 'authenticated'

  return (
    <>
      <PageHeader title='Sign Out' />

      <div className='m-auto mt-24 w-full max-w-[400px]'>
        <Card className='m-auto'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>
              <AppLogo width={300} className='m-auto w-52 p-8' />
              Sign Out
            </CardTitle>
          </CardHeader>

          <CardContent className='grid gap-4'>
            <CardDescription>
              {signedIn ? 'Are you sure you want to sign out?' : 'You are not signed in'}
            </CardDescription>
          </CardContent>

          <CardFooter>
            {signedIn ? (
              <Button type='button' variant='destructive' onClick={onSignOut} className='w-full'>
                Sign Out
              </Button>
            ) : (
              <Button onClick={onGoHome} className='w-full'>
                Go Home
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
