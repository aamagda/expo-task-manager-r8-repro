import React from 'react';
import { Text, View } from 'react-native';
import { registerRootComponent } from 'expo';

function App() {
  return <View><Text>Build-time reproduction: no device required.</Text></View>;
}

registerRootComponent(App);
