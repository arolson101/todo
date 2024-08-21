import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { queryLoader } from '@/lib/query-client'
import { cn } from '@/lib/utils'
import { BuiltInProviderType, CredentialsConfig, OAuthProviderType } from '@auth/core/providers'
import { WebAuthnConfig } from '@auth/core/providers/webauthn'
import { zodResolver } from '@hookform/resolvers/zod'
import { appLogo } from '@shared/identity'
import { credentialsSchema } from '@shared/models/credentials'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { useForm } from 'react-hook-form'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { match } from 'ts-pattern'
import { z } from 'zod'

interface Provider {
  id: string
  name: string
  callbackUrl: string
  signinUrl: string
  type: BuiltInProviderType
}

const providersQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: async () => {
    const res = await fetch('/api/auth/providers')
    const data: Record<OAuthProviderType, Provider> & {
      credentials?: CredentialsConfig
      passkey?: WebAuthnConfig
    } = await res.json()
    return data
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

export function SignInPage() {
  const { data } = useSuspenseQuery(providersQuery)
  const { credentials: credentialsProvider, passkey: passkeyProvider, ...providerMap } = data
  const providers = Object.values(providerMap)

  console.log({ data })

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
  })

  const hasCredentialsProvider = !!credentialsProvider
  const divider = hasCredentialsProvider && !!providers.length

  async function onSubmit(values: z.infer<typeof credentialsSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <Card className='m-auto max-w-96'>
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
              className={cn('flex flex-row gap-6', {
                'grid-cols-2': providers.length % 3 === 0,
                'grid-cols-3': providers.length % 2 === 0,
              })}
            >
              {providers.map((provider) => (
                <ProviderButton key={provider.name} provider={provider} className='grow' />
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
              </>
            )}
          </CardContent>

          {hasCredentialsProvider && (
            <CardFooter>
              <Button type='submit' className='w-full'>
                Sign In
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </Form>
  )
}

function ProviderButton({ className, provider }: { className?: string; provider: Provider }) {
  function signin() {
    console.log(`sign in using ${provider.name}`)
    // window.location.href = provider.signinUrl
  }

  const Icon = match(provider.id)
    .with('github', () => FaGithub)
    .with('google', () => FaGoogle)
    .otherwise(() => null)

  return (
    <Button type='button' variant='outline' className={className} onClick={signin}>
      {Icon && <Icon className='mr-2 h-4 w-4' />}
      {provider.name}
    </Button>
  )
}
