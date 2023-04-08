import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {ParamListBase} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import * as React from 'react';
import {Platform} from 'react-native';
import {Badge} from 'react-native-paper';
import {useQuery} from 'react-query';
import useUsersAtom from '../context/contextUser';
import {socket} from '../context/socket.provider';
import {ChatType, ROLE} from '../types';
import transport from '../utils/Api';
import CompletedScreen from './Messages/Completed';
import Contact from './Messages/Contact';
import OpenScreen from './Messages/Open';

type MaterialTopTabParams = {
  CompletedScreen: undefined;
  Contacts: undefined;
  OpenScreen: undefined;
};

const MaterialTopTabs = createMaterialTopTabNavigator<MaterialTopTabParams>();

function MessagesTopTap({navigation}: StackScreenProps<ParamListBase>) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      cardStyle: {flex: 1, backgroundColor: '#f4f7ff', height: 10},
    });
  }, [navigation]);

  const [currentUser] = useUsersAtom();

  const [topics, settopics] = React.useState<number>(0);
  const [open, setopen] = React.useState<number>(0);

  const {refetch} = useQuery<
    any,
    unknown,
    {totalOpen: number; totalComplete: number}
  >(
    'topics_Count',
    async () => {
      if (
        currentUser.role === ROLE.ADMIN ||
        currentUser.role === ROLE.SUPERADMIN
      ) {
        return await transport
          .get(`/mobile/conversations/topics/counts/${currentUser?.id ?? 0}`)
          .then(res => res.data);
      }
      return await transport
        .get(`/mobile/conversations/topics/count/${currentUser?.id ?? 0}`)
        .then(res => res.data);
    },
    {
      onSuccess: data => {
        settopics(data.totalComplete);
        setopen(data.totalOpen);
      },
      onError: err => {
        console.log(err);
      },
    },
  );

  React.useEffect(() => {
    socket.on('received:message:topics', async (message: ChatType) => {
      console.log('ok');
      if (message.to.id === currentUser?.id) {
        await refetch();
      }
    });
    return () => {
      socket.removeListener('received:message:topics');
    };
  }, [currentUser?.id, refetch]);

  return (
    <MaterialTopTabs.Navigator
      screenOptions={{
        lazy: true,
        animationEnabled: Platform.OS === 'android' ? true : false,
        tabBarStyle: {paddingVertical: 8},
      }}>
      <MaterialTopTabs.Screen
        name="OpenScreen"
        component={OpenScreen}
        options={{
          lazy: true,
          title: 'Open',
          tabBarBadge: () => (open ? <Badge>{open}</Badge> : undefined),
        }}
      />
      <MaterialTopTabs.Screen
        name="CompletedScreen"
        component={CompletedScreen}
        options={{
          lazy: true,
          title: 'Completed',
          tabBarBadge: () => (topics ? <Badge>{topics}</Badge> : undefined),
        }}
      />
      <MaterialTopTabs.Screen
        name="Contacts"
        component={Contact}
        options={{title: 'Contacts'}}
      />
    </MaterialTopTabs.Navigator>
  );
}
export default MessagesTopTap;
