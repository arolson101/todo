import { useSession } from '@hono/auth-js/react'
import { Link } from '@tanstack/react-router'
import { useHref } from '~/lib/use-href'

export const Nav = () => {
  const { status } = useSession() ?? {}
  const callbackUrl = useHref()

  return (
    <>
      <div className='flex gap-2 p-2'>
        <Link to='/' className='[&.active]:font-bold'>
          Home
        </Link>{' '}
        <Link to='/about' className='[&.active]:font-bold'>
          About
        </Link>
        <Link to='/todos' className='[&.active]:font-bold'>
          Todos
        </Link>
        {status === 'authenticated' ? (
          <a href='/api/auth/signout' className='[&.active]:font-bold'>
            Sign Out
          </a>
        ) : (
          <Link to='/signin' search={{ callbackUrl }} className='[&.active]:font-bold'>
            Sign In
          </Link>
        )}
      </div>
    </>
  )
}
