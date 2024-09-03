import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { mapEntries } from 'radash'
import { useColorScheme } from 'react-native'
import type { RouteObject } from 'react-router-dom'
import app from '~/../app.json'
import { pages } from '~/routes/_pages'

const Stack = createNativeStackNavigator()

function pathForRoute(route: RouteObject) {
  return route.index ? '' : route.path!
}

const linking = {
  prefixes: app.prefixes,
  config: {
    screens: mapEntries(pages, (key, value) => [key, pathForRoute(value)]),
  },
}

export function RouterProvider() {
  const scheme = useColorScheme()

  return (
    <NavigationContainer linking={linking} theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        {Object.keys(pages).map(pageName => (
          <Stack.Screen key={pageName} name={pageName} component={pages[pageName as keyof typeof pages].Component!} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
