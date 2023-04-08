/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../utils/theme';
import useUsersAtom from '../context/contextUser';
import jwt_decode from 'jwt-decode';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {User} from '../types';
import transport from '../utils/Api';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  Login: {id: number} | undefined;
  NoInternet: undefined;
};

export const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [, setCurrentUser] = useUsersAtom();

  const expiredToken = async () => {
    try {
      let value = await AsyncStorage.getItem('authToken');
      const dataSession = {token: value};

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      if (dataSession.token) {
        // try {
        await transport.post('/auth/users/mobile/verify', dataSession, {
          withCredentials: true,
        });

        const decoded = jwt_decode<User & {exp: number}>(value as string);

        if (decoded) {
          setCurrentUser(decoded);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Root',
                  state: {
                    routes: [
                      {
                        name: 'Tickets',
                      },
                    ],
                  },
                },
              ],
            }),
          );
          return;
        }
      } else {
        navigation.replace('Login');
        return;
      }
    } catch (error: any) {
      console.log('error, ,', error);
      if (error.code === 'ERR_NETWORK') {
        navigation.replace('NoInternet');
      }
      return;
    }
  };

  useEffect(() => {
    expiredToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.viewStyles}>
      <Text style={styles.textStyles}> My Tickets </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
  },
  textStyles: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
});
