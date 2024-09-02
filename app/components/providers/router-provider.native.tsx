import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, useColorScheme, View } from 'react-native'
import app from '~/../app.json'
import AboutRoute from '~/routes/about'
import IndexRoute from '~/routes/index'
import SignInRoute from '~/routes/signin'
import SignOutRoute from '~/routes/signout'
import TodosRoute from '~/routes/todos'

const Stack = createNativeStackNavigator()

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  )
}

const pages = {
  IndexRoute,
  AboutRoute,
  SignInRoute,
  SignOutRoute,
  TodosRoute,
}

const linking = {
  prefixes: app.prefixes,
  config: {
    screens: 
    // Object.keys(pages) //
    //   .reduce(
    //     (obj, pageName) => {
    //       obj[pageName] = pages[pageName].index ? 'Index' : page.path!
    //       return obj
    //     },
    //     {} as Record<string, string>,
    //   ),
    // foo: 
    {
      Index: '',
      About: AboutRoute.path!,
      SignIn: SignInRoute.path!,
      SignOut: SignOutRoute.path!,
      Todos: TodosRoute.path!,
    },
  },
}

export function RouterProvider() {
  const scheme = useColorScheme()

  return (
    <NavigationContainer linking={linking} theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name='Index' component={IndexRoute.Component!} />
        <Stack.Screen name='About' component={AboutRoute.Component!} />
        <Stack.Screen name='SignIn' component={SignInRoute.Component!} />
        <Stack.Screen name='SignOut' component={SignOutRoute.Component!} />
        <Stack.Screen name='Todos' component={TodosRoute.Component!} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
