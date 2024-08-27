import { useSession } from 'next-auth/react'
import { Link, makeRoute } from '~/lib/router'

export default makeRoute({
  index: true,
  Component: () => {
    const session = useSession()

    if (session.data) {
      return (
        <div className='p-2'>
          <h3>Welcome Home!</h3>
        </div>
      )
    } else {
      return (
        <div className='p-2'>
          <h3>Welcome Home!</h3>
          <p>
            <Link to='/signin'>Sign In</Link>
          </p>
        </div>
      )
    }
  },
})
