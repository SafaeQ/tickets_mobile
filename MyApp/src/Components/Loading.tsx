import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

const Loading = () => (
  <View style={[styles.container, styles.horizontal]}>
    <ActivityIndicator size="large" color="#00ff00" animating={true} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    top: 0,
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default Loading;
