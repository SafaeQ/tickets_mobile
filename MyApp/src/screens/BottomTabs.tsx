import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../utils/theme';
import MessagesTopTap from './MessagesTopTap';
import Tickets from './Tickets';
import Icon from 'react-native-vector-icons/AntDesign';
import React, {useState} from 'react';
import {Alert, StyleSheet, TouchableOpacity} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import {useInfiniteQuery} from 'react-query';
import {ChatType, ROLE, Topic} from '../types';
import transport from '../utils/Api';
import {StackNavigationProp} from '@react-navigation/stack';
import useUsersAtom from '../context/contextUser';
import {socket} from '../context/socket.provider';

const Tab = createBottomTabNavigator();
type RootStackParamList = {
  create: {id: number} | undefined;
};

let page = 1;
const pageSize = 20;

function Home() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const Logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await CookieManager.clearAll();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
            },
          ],
        }),
      );
    } catch (error) {
      console.log('error', error);
    }
  };

  const permissionLog = () => {
    Alert.alert('Are you Sure ?', 'you will logout after press Yes', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => Logout(),
      },
    ]);
  };
  const [currentUser] = useUsersAtom();
  const [topics, setTopicsPager] = useState<Topic[]>([]);

  const {refetch} = useInfiniteQuery<any, unknown, {topics: Topic[]}>(
    'topics',
    async ({pageParam = page}) => {
      return await transport
        .get(
          `/mobile/conversations/topics?pageCurrent=${pageParam}&pageSize=${pageSize}`,
        )
        .then(res => res.data);
    },
    {
      onSuccess: data => {
        if (data == null) {
          setTopicsPager([]);
        } else {
          setTopicsPager(data.pages.flatMap(p => p.topics));
        }
      },
      onError: err => {
        console.log(err);
      },
    },
  );

  React.useEffect(() => {
    socket.on('received:message:topics', async (message: ChatType) => {
      if (message.to.id === currentUser?.id) {
        await refetch();
      }
    });
    return () => {
      socket.removeListener('received:message:topics');
    };
  }, [currentUser?.id, refetch]);
  const sumBadge = React.useMemo(
    () =>
      topics
        ? topics.reduce((prev, current) => prev + current?.unreadMessages, 0)
        : 0,
    [topics],
  );
  let badge = sumBadge === 0 ? undefined : sumBadge > 10 ? '+9' : sumBadge;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          const icons: any = {
            Tickets: 'tags',
            Planning: 'calendar',
            Messages: 'wechat',
          };

          return <Icon name={icons[route.name]} color={color} size={size} />;
        },
        tabBarActiveTintColor: COLORS.blue,
        tabBarItemStyle: {
          margin: 5,
          borderRadius: 10,
        },
        tabBarStyle: {
          borderTopWidth: 0,
          width: '100%',
          backgroundColor: '#fff',
          height: '10%',
        },
        tabBarHideOnKeyboard: true,
        lazy: true,
      })}>
      <Tab.Screen
        name="Tickets"
        component={Tickets}
        options={{
          title: 'Tickets',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: COLORS.white,
          },
          headerTitleAlign: 'center',
          headerRight: () => (
            <Icon
              name="logout"
              onPress={permissionLog}
              size={25}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{paddingRight: 20}}
              color={COLORS.white}
            />
          ),
          headerLeft: () => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.touchableOpacityStyle}>
                <Icon
                  name="pluscircle"
                  size={30}
                  color={COLORS.white}
                  onPress={() => {
                    navigation.navigate('create');
                  }}
                />
              </TouchableOpacity>
            );
          },
          headerLeftLabelVisible: true,
          headerStyle: {
            backgroundColor: COLORS.blue,
          },
        }}
      />
      {currentUser.role !== ROLE.TEAMMEMBER ? (
        <Tab.Screen
          name="Messages"
          component={MessagesTopTap}
          options={{
            title: 'Messages',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: COLORS.white,
            },
            headerTitleAlign: 'center',
            headerLeftLabelVisible: true,
            headerStyle: {
              backgroundColor: COLORS.blue,
            },
            headerTintColor: COLORS.white,
            tabBarBadge: badge ? badge : undefined,
          }}
        />
      ) : null}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7ff',
    height: '100%',
  },
  touchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    left: 10,
  },
});
export default Home;
