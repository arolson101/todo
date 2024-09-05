import * as React from 'react'
import { PropsWithChildren } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  FontIcon,
  NavigationViewPaneDisplayMode,
  NavigationViewPriority,
  TextBlock,
  WinUI,
} from 'react-native-xaml'

export function Window({ children }: PropsWithChildren) {
  const { height, width } = useWindowDimensions()

  // const scheme = useColorScheme()
  const [text, setText] = React.useState('initial text')

  return (
    <WinUI.NavigationView width={width} height={height} paneDisplayMode={NavigationViewPaneDisplayMode.Left}>
      <WinUI.NavigationViewItem
        content='Item 1'
        onTapped={() => setText('text #1')}
        priority={NavigationViewPriority.MenuItem}
      >
        <FontIcon glyph='&#xE790;' />
      </WinUI.NavigationViewItem>
      <WinUI.NavigationViewItem
        content='Item 2'
        onTapped={() => setText('text #2')}
        priority={NavigationViewPriority.FooterMenuItem}
      />
      <TextBlock text='hi' priority={NavigationViewPriority.Content} />
    </WinUI.NavigationView>
  )
}
