import { createFileRoute } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const { data: session, status } = useSession() || {}

  return (
    <>
      <div className='p-2'>Session status: {status}</div>
      <div className='p-2'>I am {session?.user?.name ?? 'not signed in'}</div>
    </>
  )
}
