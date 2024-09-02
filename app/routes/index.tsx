import { useSession } from 'next-auth/react'
import { SafeAreaView, Text } from 'react-native'
import { Link } from '~/components/ui/link'
import { makeRoute } from '~/lib/router'

export default makeRoute({
  index: true,
  Component: () => {
    // const session = useSession()

    // if (session.data) {
    //   return <Text className='p-2'>Welcome Home!</Text>
    // } else {
    return (
      <SafeAreaView>
        <Text className='p-2'>
          <Text className='text-primary-foreground'>Welcome Home!</Text>
          <Link to='/signin' className='text-blue-300'>
            Sign In
          </Link>
        </Text>
      </SafeAreaView>
    )
    // }
  },
})
