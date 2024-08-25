import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
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
}
