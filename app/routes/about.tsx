import { createFileRoute } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'
import { PageHeader } from '~/components/page-header'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { data: session, status } = useSession()

  return (
    <>
      <PageHeader title='About' />
      <div className='p-2'>Session status: {status}</div>
      <div className='p-2'>I am {session?.user?.name ?? 'not signed in'}</div>
    </>
  )
}
