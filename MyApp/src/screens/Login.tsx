import React, {useState} from 'react';
import {
  Image,
  TextInput,
  StyleSheet,
  Platform,
  View,
  Text,
  Pressable,
} from 'react-native';
import {useMutation} from 'react-query';
import {useForm, Controller} from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from 'react-native-paper';
import transport from '../utils/Api';
import {COLORS} from '../utils/theme';
import Loading from '../Components/Loading';
import {StackScreenProps} from '@react-navigation/stack';
import {CommonActions, ParamListBase} from '@react-navigation/native';
import {useTogglePasswordVisibility} from '../Components/passwordvisivblity';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-simple-toast';
import axios from 'axios';
import useUsersAtom from '../context/contextUser';
const publicIP = async () => {
  try {
    const {data} = await axios.get('https://ident.me/');
    return data;
  } catch (error: any) {
    throw new Error('Unable to get IP address.');
  }
};

const Login = ({navigation}: StackScreenProps<ParamListBase>) => {
  const [, setCurrentUser] = useUsersAtom();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const {passwordVisibility, rightIcon, handlePasswordVisibility} =
    useTogglePasswordVisibility();

  const loginMutation = useMutation(
    async (data: {username: string; password: string; ip: string}) => {
      setIsLoading(true);
      return await transport
        .post('/auth/users/mobile/login', data, {
          withCredentials: true,
        })
        .then((res: any) => res.data);
    },
    {
      onSuccess: async user => {
        try {
          setCurrentUser(user.user);
          setIsLoading(false);
          // set async storage
          await AsyncStorage.setItem('authToken', user.authToken);
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
          if (Platform.OS === 'android') {
            Toast.show('Successful login');
          } else {
            //Alert.alert('Successful login');
            Toast.show('Successful login');
          }
        } catch (error) {
          console.log('errore', error);
        }
      },
      onError: (error: any) => {
        // console.log('response');
        setIsLoading(false);
        Toast.show('Incorrect Credentials');
        if (error.code === 'ERR_NETWORK') {
          Toast.show('no internet connection');
          return;
        }
      },
    },
  );

  const onSubmit = async (values: {username: string; password: string}) => {
    const ip = await publicIP();
    loginMutation.mutate({...values, ip});
  };

  let imagePath = require('../img/adsglory-removebg-preview.png');
  let imageBackground = require('../img/adsglory-without-bg.png');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <Image source={imageBackground} style={styles.imageBackground} />
        <View style={styles.login}>
          <View>
            <Image style={styles.loginImg} source={imagePath} />
            <View style={styles.inputView}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    placeholder="Username"
                    style={styles.TextInput}
                    onChangeText={onChange}
                    value={value}
                    clearButtonMode={'always'}
                  />
                )}
                name="username"
              />
              {errors.username && (
                <Text style={styles.error}>Username is required.</Text>
              )}
            </View>
            <View style={styles.inputView}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({field: {onChange, value}}) => (
                  <>
                    <TextInput
                      placeholder="Password"
                      style={styles.TextInput}
                      onChangeText={onChange}
                      value={value}
                      underlineColorAndroid="transparent"
                      clearButtonMode="while-editing"
                      secureTextEntry={passwordVisibility}
                    />
                    <Pressable
                      onPress={handlePasswordVisibility}
                      style={styles.eyePassword}>
                      <Icon name={rightIcon} size={20} color="#232323" />
                    </Pressable>
                  </>
                )}
                name="password"
              />
              {errors.password && (
                <Text style={styles.error}>Password is required.</Text>
              )}
            </View>
            <View style={styles.loginButtonView}>
              <Button
                color={COLORS.transBlue2}
                style={styles.loginButton}
                disabled={isLoading}
                onPress={handleSubmit(onSubmit)}>
                <Text style={styles.loginButton.text}>login</Text>
              </Button>
            </View>
            {isLoading ? <Loading /> : <View />}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {height: '100%', backgroundColor: '#fff'},
  container: {
    height: '100%', //700
    display: 'flex',
    justifyContent: 'center',
    // backgroundColor: "#fff",
    flexDirection: 'column',
  },
  eyePassword: {
    // display: 'flex',
    justifyContent: 'center',
    margin: 10,
    position: 'absolute',
    right: 0,
    bottom: 10,
  },

  login: {
    // marginBottom: 20 * vh,
  },
  imageBackground: {
    width: 450,
    height: 450,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{translateX: -225}, {translateY: -225}, {rotateZ: '45deg'}],
    backgroundColor: 'rgb(255, 255, 255)',
    opacity: 0.13,
  },
  loginImg: {
    height: '50%',
    width: '100%',
  },
  inputView: {
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    // borderBottomWidth: 0.5,
  },

  TextInput: {
    border: '1px solid #1c74bb',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,.8)',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.black,
    color: 'black',
  },
  loginButton: {
    borderRadius: 0,
    backgroundColor: '#1c74bb',
    text: {
      color: '#ffffff',
    },
  },
  loginButtonView: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  error: {
    color: 'red',
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default Login;
