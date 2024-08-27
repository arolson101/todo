import { useSession } from 'next-auth/react'
import { makeRoute } from '~/lib/router'

export default makeRoute({ path: 'about', Component: About })

function About() {
  const { data: session, status } = useSession()

  return (
    <>
      <div className='p-2'>Session status: {status}</div>
      <div className='p-2'>I am {session?.user?.name ?? 'not signed in'}</div>
    </>
  )
}
