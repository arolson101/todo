import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'

// import { useState } from 'react'
// import { api } from '~/lib/trpc'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const session = useSession()
  // const [stream, setStream] = useState<number>(0)

  // api.todo.stream.useSubscription(void 0, {
  //   onData(data) {
  //     console.log(data)
  //     setStream(data)
  //   },
  // })

  if (session.data) {
    return (
      <div className='p-2'>
        <h3>Welcome Home!</h3>
        {/* <div>{JSON.stringify(stream)}</div> */}
      </div>
    )
  } else {
    return (
      <div className='p-2'>
        <h3>Welcome Home!</h3>
        {/* <div>{JSON.stringify(stream)}</div> */}
        <p>
          <Link to='/signin'>Sign In</Link>
        </p>
      </div>
    )
  }
}
