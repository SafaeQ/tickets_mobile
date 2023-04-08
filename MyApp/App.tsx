import 'react-native-gesture-handler';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Login from './src/screens/Login';
import ChatScreen from './src/screens/ChatScreen';
import {COLORS, SHADOWIOS} from './src/utils/theme';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import Home from './src/screens/BottomTabs';
import Chat from './src/screens/Messages/Chat';
import StatusBtn from './src/Components/StatusBtn';
import TabBadge from './src/Components/TabBadgeOpen';
import {SplashScreen} from './src/screens/SplashScreen';
import {Alert, AppState, BackHandler, Platform} from 'react-native';
import CreateTickets from './src/screens/CreateTickets';
import KeyboardManager from 'react-native-keyboard-manager';
import Toast from 'react-native-simple-toast';
import notifee from '@notifee/react-native';

Platform.OS === 'ios' ? KeyboardManager.setEnable(true) : null;

const Stack = createStackNavigator();

import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import transport from './src/utils/Api';
import LoadingScreen from './src/Components/LoadingScreen';
import {ShowFullImage} from './src/screens/Messages/Conversation/showFullImage';
import NoConnection from './src/screens/NoConnection';

type RootStackParamList = {
  Login: {id: number} | undefined;
  Loading: {id: number} | undefined;
};

export default function App() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Request permissions (required for iOS)
  notifee.requestPermission();

  React.useEffect(() => {
    const event = Platform.OS === 'ios' ? 'change' : 'focus';
    const subscription = AppState.addEventListener(event, async () => {
      try {
        let value = await AsyncStorage.getItem('authToken');
        const dataSession = {token: value};

        if (dataSession.token) {
          try {
            await transport.post('/auth/users/mobile/verify', dataSession, {
              withCredentials: true,
            });
          } catch (error: any) {
            if (error.code === 'ERR_NETWORK') {
              Platform.OS === 'android'
                ? Alert.alert('No Internet Connection', '', [
                    {
                      text: 'Ok',
                      onPress: () => BackHandler.exitApp(),
                    },
                  ])
                : Toast.show('No Internet Connection', 10000);
            } else {
              console.log('error:', error);
              // delete cookies w token
              await AsyncStorage.removeItem('authToken');
              await CookieManager.clearAll();
              navigation.navigate('Loading');
              navigation.navigate('Login');
              return;
            }
          }
        } else {
          navigation.navigate('Login');
          return;
        }
      } catch (error) {
        console.log('errorr', error);
        navigation.navigate('Login');
        return;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          animationEnabled: Platform.OS === 'android' ? true : false,
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false, animationEnabled: false}}
        />
        <Stack.Screen
          name="NoInternet"
          component={NoConnection}
          options={{headerShown: false, animationEnabled: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Root"
          component={Home}
          options={{headerShown: false, presentation: 'modal'}}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Chat',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: COLORS.white,
            },
            headerTitleAlign: 'center',
            headerLeftLabelVisible: false,
            headerStyle: {
              backgroundColor: COLORS.blue,
              ...SHADOWIOS,
            },
            headerTintColor: COLORS.white,
          }}
        />
        <Stack.Screen
          name="create"
          component={CreateTickets}
          options={{
            title: 'Create new Ticket',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: COLORS.white,
            },
            headerTitleAlign: 'center',
            headerLeftLabelVisible: false,
            headerStyle: {
              backgroundColor: COLORS.blue,
              ...SHADOWIOS,
            },
            headerTintColor: COLORS.white,
          }}
        />
        <Stack.Screen
          name="msg"
          component={Chat}
          options={{
            title: 'Messaging',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: COLORS.white,
            },
            headerTitleAlign: 'center',
            // headerBackVisible: true,
            headerLeftLabelVisible: false,
            headerStyle: {
              backgroundColor: COLORS.blue,
              ...SHADOWIOS,
            },
            headerTintColor: COLORS.white,
            headerRight: () => <StatusBtn />,
          }}
        />

        <Stack.Screen
          name="Badge"
          component={TabBadge}
          options={{headerShown: false, presentation: 'modal'}}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{headerShown: false, presentation: 'modal'}}
        />
        <Stack.Screen
          name="showFullImage"
          component={ShowFullImage}
          options={{
            title: '',
            headerTitleAlign: 'center',
            headerLeftLabelVisible: false,
            headerStyle: {
              backgroundColor: COLORS.black,
              ...SHADOWIOS,
            },
            headerTintColor: COLORS.white,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </>
  );
}
