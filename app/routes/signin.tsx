import { zodResolver } from '@hookform/resolvers/zod'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { getProviders, signIn, signOut, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { GoPasskeyFill } from 'react-icons/go'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { PageHeader } from '~/components/page-header'
import { AppLogo } from '~/components/ui/app-logo'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { queryLoader } from '~/lib/query-client'
import { cn } from '~/lib/utils'
import { credentialsSchema } from '~shared/models/credentials'

type ClientSafeProvider = NonNullable<Awaited<ReturnType<typeof getProviders>>>[string]

const providersQuery = queryOptions({
  queryKey: ['auth-providers'],
  queryFn: async () => {
    const providers = await getProviders()
    if (!providers) {
      throw new Error('failed to get providers')
    }
    return providers
  },
})

export const Route = createFileRoute('/signin')({
  loader: queryLoader(providersQuery),
  component: SignInPage,
  validateSearch: zodSearchValidator(
    z.object({
      redirect: z.string().optional(),
      error: z.boolean().default(false).optional(),
    }),
  ),
})

function SignInPage() {
  const { redirect, error } = Route.useSearch()
  const nav = useNavigate()
  const { data } = useSuspenseQuery(providersQuery)
  const { credentials: credentialsProvider, ...providerMap } = data ?? {}
  const providers = Object.values(providerMap)

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: '',
      password: '',
      register: false,
    },
  })

  const { status } = useSession()
  const signedIn = status === 'authenticated'

  const hasCredentialsProvider = !!credentialsProvider && !signedIn
  const divider = hasCredentialsProvider && !!providers.length && !signedIn

  function providerSignIn(id: string) {
    signIn(id, { callbackUrl: redirect ?? '/' })
  }

  async function onSubmit(values: z.infer<typeof credentialsSchema>) {
    const res = await signIn(credentialsProvider?.id, { redirect: false }, values)
    console.log(`signIn(${credentialsProvider?.id})`, values, res)
    if (res?.ok) {
      nav({ to: redirect ?? '/' })
    }
  }

  async function onSignOut() {
    await signOut({ redirect: false })
    nav({ to: '/' })
  }

  return (
    <>
      <PageHeader title='Sign In' />
      <div className='m-auto mt-24 w-full max-w-[400px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Card className='m-auto'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl'>
                  <AppLogo width={300} className='m-auto w-52 p-8' />
                  Sign In
                </CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4'>
                <CardDescription>
                  {error
                    ? 'You must sign in to view this page'
                    : signedIn
                      ? "You're already signed in- do you want to sign out?"
                      : providers.length === 1
                        ? `Sign in with ${providers[0].name}`
                        : 'Sign in with your provider'}
                </CardDescription>
                <div
                  className={cn('grid gap-6', {
                    'grid-cols-2': providers.length > 1,
                  })}
                >
                  {!signedIn &&
                    providers.map((provider) => (
                      <ProviderButton
                        key={provider.name}
                        provider={provider}
                        className='grow'
                        onClick={providerSignIn}
                      />
                    ))}
                </div>

                {divider && (
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <span className='w-full border-t' />
                    </div>
                    <div className='relative flex justify-center text-xs uppercase'>
                      <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
                    </div>
                  </div>
                )}

                {hasCredentialsProvider && (
                  <>
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder='name@example.com' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type='password' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='register'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                          <div className='space-y-0.5'>
                            <FormLabel>Create a new account</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>

              <CardFooter className='flex flex-col gap-4'>
                {hasCredentialsProvider && (
                  <Button type='submit' className='w-full'>
                    Sign In
                  </Button>
                )}
                {signedIn && (
                  <>
                    <Button type='button' className='w-full' asChild>
                      <a href='/'>Return Home</a>
                    </Button>
                    <Button type='button' variant='destructive' className='w-full' onClick={onSignOut}>
                      Sign Out
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </>
  )
}

function ProviderButton({
  className,
  provider,
  onClick,
}: {
  className?: string
  provider: ClientSafeProvider
  onClick: (provider: string) => void
}) {
  const Icon = match(provider.id)
    .with('github', () => FaGithub)
    .with('google', () => FaGoogle)
    .with('passkey', () => GoPasskeyFill)
    .otherwise((id) => {
      console.log(`unhandled icon for type '${id}'`)
      return null
    })

  return (
    <Button type='button' variant='outline' className={className} onClick={() => onClick(provider.id)}>
      {Icon && <Icon className='mr-2 h-4 w-4' />}
      {provider.name}
    </Button>
  )
}
