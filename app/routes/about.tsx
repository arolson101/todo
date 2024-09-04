import { useSession } from 'next-auth/react'
import { Text } from 'react-native'
import { makeRoute } from '~/lib/router'

export default makeRoute({ path: 'about', Component: About })

function About() {
  const { data: session, status } = useSession()

  return (
    <>
      <Text className='p-2'>Session status: {status}</Text>
      <Text className='p-2'>I am {session?.user?.name ?? 'not signed in'}</Text>
    </>
  )
}
