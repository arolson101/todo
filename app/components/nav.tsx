import { Link } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'

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
        {status === 'authenticated' ? (
          <Link to='/signout' className='[&.active]:font-bold'>
            Sign Out
          </Link>
        ) : (
          <Link to='/signin' className='[&.active]:font-bold'>
            Sign In
          </Link>
        )}
      </div>
    </>
  )
}
