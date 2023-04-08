import React from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../utils/theme';

const NoConnection = () => {
  let imageBackground = require('../img/Signal_searching.png');
  return (
    <View style={styles.container}>
      <View style={{}}>
        <View style={styles.viewText}>
          <Text style={styles.textStyles}> No internet connection!</Text>
        </View>
        <View style={styles.viewStyles}>
          <Image source={imageBackground} style={styles.imageBackground} />
          <Text style={styles.para}>
            Please check your internet connection and try again.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4987D0',
  },
  viewStyles: {
    // flex: 1,
    height: Platform.OS === 'android' ? '95%' : '95%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderBottomEndRadius: 100,
    borderBottomLeftRadius: 100,
  },
  viewText: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    position: 'absolute',
    zIndex: 999,
    alignSelf: 'center',
    top: '15%',
  },
  textStyles: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  para: {
    color: 'grey',
    fontSize: 14,
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 999,
    alignSelf: 'center',
    bottom: '15%',
    alignContent: 'center',
  },
  imageBackground: {
    width: 350,
    height: 300,
    position: 'relative',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  imageContanier: {
    // width: '50%',
    // height: '50%',
  },
});

export default NoConnection;
