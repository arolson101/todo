import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { queryLoader } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { appLogo } from '@shared/identity'
import { credentialsSchema } from '@shared/models/credentials'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { getProviders, signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { GoPasskeyFill } from 'react-icons/go'
import { match } from 'ts-pattern'
import { z } from 'zod'

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
      callbackUrl: z.string().optional(),
    }),
  ),
})

const formSchema = credentialsSchema //
  .extend({ confirm: z.string() })
  .refine(
    ({ password, confirm }) => password === confirm, //
    { message: 'Passwords must match', path: ['confirm'] },
  )

function SignInPage() {
  const { callbackUrl } = Route.useSearch()
  const { data } = useSuspenseQuery(providersQuery)
  const { credentials: credentialsProvider, ...providerMap } = data ?? {}
  const providers = Object.values(providerMap)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirm: '',
      register: false,
    },
  })

  const hasCredentialsProvider = !!credentialsProvider
  const divider = hasCredentialsProvider && !!providers.length

  async function onSubmit({ confirm, ...values }: z.infer<typeof formSchema>) {
    const res = await signIn(credentialsProvider.id, { callbackUrl, redirect: true }, values)
    console.log(`signIn(${credentialsProvider.id})`, values, res)
  }

  const register = form.watch('register')

  return (
    <div className='flex h-full'>
      <Tabs
        className='m-auto w-full max-w-[400px]'
        onValueChange={() => form.setValue('register', !register)}
        value={register ? 'register' : 'signin'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Card className='m-auto'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl'>
                  <img src={appLogo} className='m-auto w-52 p-8' />
                  Sign In
                </CardTitle>
              </CardHeader>
              <CardContent className='grid gap-4'>
                <CardDescription>
                  {providers.length === 1 ? `Sign in with ${providers[0].name}` : 'Sign in with your provider'}
                </CardDescription>
                <div
                  className={cn('grid gap-6', {
                    'grid-cols-2': providers.length > 1,
                  })}
                >
                  {providers.map((provider) => (
                    <ProviderButton
                      key={provider.name}
                      provider={provider}
                      className='grow'
                      callbackUrl={callbackUrl}
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
                    <TabsList className='w-full'>
                      <TabsTrigger value='signin' className='w-full'>
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value='register' className='w-full'>
                        Register
                      </TabsTrigger>
                    </TabsList>

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

                    <TabsContent value='register'>
                      <FormField
                        control={form.control}
                        name='confirm'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type='password' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </>
                )}
              </CardContent>

              {hasCredentialsProvider && (
                <CardFooter>
                  <Button type='submit' className='w-full'>
                    <TabsContent value='signin'>Sign In</TabsContent>
                    <TabsContent value='register'>Register</TabsContent>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}

function ProviderButton({
  className,
  provider,
  callbackUrl,
}: {
  className?: string
  provider: ClientSafeProvider
  callbackUrl?: string
}) {
  function click() {
    signIn(provider.id, { callbackUrl })
  }

  const Icon = match(provider.id)
    .with('github', () => FaGithub)
    .with('google', () => FaGoogle)
    .with('passkey', () => GoPasskeyFill)
    .otherwise((id) => {
      console.log(`unhandled icon for type '${id}'`)
      return null
    })

  return (
    <Button type='button' variant='outline' className={className} onClick={click}>
      {Icon && <Icon className='mr-2 h-4 w-4' />}
      {provider.name}
    </Button>
  )
}
