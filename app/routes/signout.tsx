import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { appLogo } from '~shared/identity'

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
  validateSearch: zodSearchValidator(
    z.object({
      callbackUrl: z.string().optional(),
    }),
  ),
})

function SignOutPage() {
  const nav = useNavigate()
  const [wasSignedOut, setWasSignedOut] = useState(false)

  function onGoHome() {
    nav({ to: '/' })
  }

  async function onSignOut() {
    await signOut({ redirect: false })
    setWasSignedOut(true)
  }

  const { status } = useSession()
  const signedIn = status === 'authenticated'

  return (
    <div className='m-auto mt-24 w-full max-w-[400px]'>
      <Card className='m-auto'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>
            <img src={appLogo} className='m-auto w-52 p-8' />
            Sign Out
          </CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4'>
          <CardDescription>
            {signedIn
              ? 'Are you sure you want to sign out?'
              : wasSignedOut
                ? 'You have been signed out'
                : 'You not signed in'}
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
  )
}
