import React from 'react'
import { Button, StatusBar, StyleSheet, Text, View } from 'react-native'
import NativeSplitView, { SplitViewDividerStyle } from '~/components/react-native-macos-splitview'
import { Index } from '~/routes/index'
import { SidebarView } from './SidebarView'

const { SplitViewDividerStylePaneSplitter } = SplitViewDividerStyle

export const Window = ({ children }: React.PropsWithChildren) => {
  return (
    <NativeSplitView
      style={[styles.container, styles.splitView]}
      // dividerStyle={SplitViewDividerStylePaneSplitter}
      vertical={true}
    >
      <SidebarView style={styles.sidebar}>
        <View style={styles.masterContainer}>
          <Text style={styles.sectionTitle}>See Your Changes</Text>
          <Text style={styles.sectionDescription}>
            <Text>see your changes view</Text>
          </Text>
          <Button title='Click me #1!' onPress={() => console.warn('#1 Pressed')} />
        </View>
      </SidebarView>
      <View style={styles.main}>{children}</View>
    </NativeSplitView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flex: 1,
  },
  main: {
    flex: 2,
  },
  splitView: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  masterContainer: {
    alignItems: 'flex-start',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
  },
  detailContainer: {
    backgroundColor: 'lightgrey',
    alignItems: 'flex-start',
    flexGrow: 1,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#444',
  },
})
