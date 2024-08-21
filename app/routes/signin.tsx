import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { queryLoader } from '@/lib/query-client'
import { CredentialsConfig, OAuthConfig, OAuthProviderType } from '@auth/core/providers'
import { WebAuthnConfig } from '@auth/core/providers/webauthn'
import { useForm } from '@tanstack/react-form'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { Fragment } from 'react/jsx-runtime'
import { z } from 'zod'

const providersQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: async () => {
    const res = await fetch('/api/auth/providers')
    const data: Record<OAuthProviderType, OAuthConfig<any>> & {
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

function SignInPage() {
  const { callbackUrl } = Route.useSearch()
  const { data } = useSuspenseQuery(providersQuery)
  const { credentials: credentialsProvider, passkey: passkeyProvider, ...providerMap } = data

  const form = useForm({
    defaultValues: {
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2'>
          {credentialsProvider && <UserPassForm provider={credentialsProvider} />}
          {passkeyProvider && <PasskeyForm provider={passkeyProvider} />}
          {Object.values(providerMap).map((provider, idx) => (
            <Fragment key={provider.id}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
              >
                <button type='submit'>
                  <span>Sign in with {provider.name}</span>
                </button>
              </form>
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UserPassForm({ provider }: { provider: CredentialsConfig }) {
  const form = useForm({
    defaultValues: {
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <label htmlFor='email'>
        Email
        <input name='email' id='email' />
      </label>
      <label htmlFor='password'>
        Password
        <input name='password' id='password' />
      </label>
      <input type='submit' value='Sign In' />
    </form>
  )
}

function PasskeyForm({ provider }: { provider: OAuthConfig<any> }) {
  const form = useForm({
    defaultValues: {
      fullName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <p>{provider.name}</p>
      <label htmlFor='email'>
        Email
        <input name='email' id='email' />
      </label>
      <label htmlFor='password'>
        Password
        <input name='password' id='password' />
      </label>
      <input type='submit' value='Sign In' />
    </form>
  )
}
