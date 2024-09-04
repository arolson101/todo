import { useSession } from 'next-auth/react'
import { SafeAreaView, View } from 'react-native'
import { Link } from '~/components/ui/link'
import { Text } from '~/components/ui/text'
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
        <View className='bg-background p-2'>
          <Text>Welcome Home!</Text>
          <Link to='/signin'>Sign In</Link>
        </View>
      </SafeAreaView>
    )
    // }
  },
})
