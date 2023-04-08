import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const Planning = () => {
  let imageBackground = require('../img/adsglory-without-bg.png');

  return (
    <View style={styles.container}>
      <Image source={imageBackground} style={styles.imageBackground} />
      <Text style={styles.Text}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
  },
  Text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4e9af9',
  },
  imageBackground: {
    width: 450,
    height: 450,
    position: 'absolute',
    left: '40%',
    top: '50%',
    transform: [{translateX: -225}, {translateY: -225}, {rotateZ: '45deg'}],
    // backgroundColor: 'rgb(255, 255, 255)',
    opacity: 0.13,
  },
});
export default Planning;
