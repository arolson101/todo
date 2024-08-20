import { useSession } from '@hono/auth-js/react'
import { Link } from '@tanstack/react-router'

export const Nav = () => {
  const { status } = useSession()

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
        {status === 'loading' ? (
          ' '
        ) : status === 'authenticated' ? (
          <a href='/api/auth/signout' className='[&.active]:font-bold'>
            Sign Out
          </a>
        ) : (
          <a href='/api/auth/signin' className='[&.active]:font-bold'>
            Sign In
          </a>
        )}
      </div>
    </>
  )
}
