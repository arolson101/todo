import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { signOut } from 'next-auth/react'
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
  const { callbackUrl } = Route.useSearch()

  function onSignOut() {
    signOut({ callbackUrl, redirect: Boolean(callbackUrl) })
  }

  return (
    <div className='m-auto w-full max-w-[400px]'>
      <Card className='m-auto'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>
            <img src={appLogo} className='m-auto w-52 p-8' />
            Sign Out
          </CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4'>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardContent>

        <CardFooter>
          <Button type='button' variant='destructive' onClick={onSignOut} className='w-full'>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
