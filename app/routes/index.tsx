import { useSession } from 'next-auth/react'
import { SafeAreaView, Text, View } from 'react-native'
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
        <View className='p-2'>
          <Text className='text-foreground'>Welcome Home!</Text>
          <Link to='/signin'>Sign In</Link>
        </View>
      </SafeAreaView>
    )
    // }
  },
})
