import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { mapEntries } from 'radash'
import { useColorScheme } from 'react-native'
import type { RouteObject } from 'react-router-dom'
import app from '~/../app.json'
import { nameof } from '~/lib/nameof'
import { pages } from '~/routes/_pages'
import { NavigationStack } from '../ui/navigation-stack'

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
      <NavigationStack.Navigator initialRouteName={nameof<typeof pages>('Index')}>
        {Object.keys(pages).map(pageName => (
          <NavigationStack.Screen
            key={pageName}
            name={pageName}
            component={pages[pageName as keyof typeof pages].Component!}
          />
        ))}
      </NavigationStack.Navigator>
    </NavigationContainer>
  )
}
