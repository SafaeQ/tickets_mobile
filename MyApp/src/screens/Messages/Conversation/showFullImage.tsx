// import React, {createRef, useRef, useState} from 'react';
// import {Animated, Dimensions, StyleSheet, View} from 'react-native';
// import {
//   PinchGestureHandler,
//   PanGestureHandler,
//   State,
// } from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import ImageView from 'react-native-image-viewing';

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

export const ShowFullImage = (props: any) => {
  const navigation = useNavigation();

  const [visible, setIsVisible] = useState(true);
  return (
    <View style={styles.view}>
      <ImageView
        images={[{uri: props.route.params.img}]}
        imageIndex={0}
        visible={visible}
        presentationStyle={'overFullScreen'}
        onRequestClose={() => {
          setIsVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    backgroundColor: 'black',
    width: width,
    height: height,
  },
  background: {
    height: height,
    width: width,
    alignItems: 'center',
    flex: 1,
  },
});
