import React, {useEffect, useState} from 'react';
import {useQuery} from 'react-query';
import {View, Platform} from 'react-native';
import {StyleSheet} from 'react-native';
import {ROLE} from '../types/index';
import {COLORS, SHADOW} from '../utils/theme';
import transport from '../utils/Api';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import OpenTickets from './TicketStatusTabs/OpenTickets';
import ResolvedTickets from './TicketStatusTabs/ResolvedTickets';
import ProgressTickets from './TicketStatusTabs/ProgressTickets';
import ClosedTickets from './TicketStatusTabs/ClosedTickets';
import {Badge} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import IconOpen from 'react-native-vector-icons/Octicons';
import useUsersAtom from '../context/contextUser';
import useTicketsAtom from '../context/contextTickets';
import ReOpenTickets from './TicketStatusTabs/ReOpenTickets';
import {socket} from '../context/socket.provider';
import notifee from '@notifee/react-native';

export interface IqueryParams {
  entities: Array<string>;
  errorMessage: String;
  totalCount: number;
}
type MaterialTopTabParams = {
  ResolvedScreen: undefined;
  ClosedScreen: undefined;
  OpenScreen: undefined;
  ProgressScreen: undefined;
  ReOpenScreen: undefined;
};

const MaterialTopTabs = createMaterialTopTabNavigator<MaterialTopTabParams>();

const Tickets = () => {
  const [currentUser] = useUsersAtom();
  const [ticketsGlobl, setTicketsGlobal] = useTicketsAtom();
  const [ids, setData] = useState<number[]>([]);

  let queryParams = {};
  let filter = {};

  if (currentUser.user_type === 'PROD') {
    if (currentUser.role === 'TEAMMEMBER') {
      filter = {
        user: {
          id: currentUser.id,
        },
      };
    } else if (currentUser.role === 'TEAMLEADER') {
      filter = {
        issuer_team: {
          id: currentUser.team.id,
        },
        entity: {
          id: currentUser.entity.id,
        },
      };
    } else if (currentUser.role === 'CHEF') {
      filter = {
        entity: {
          id: currentUser.entity.id,
        },
      };
    }
    queryParams = {
      access_entity: currentUser?.access_entity ?? [],
      access_team: currentUser?.access_team ?? [],
      filter,
      read: currentUser?.id ?? 0,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    };
  } else if (currentUser.user_type === 'SUPPORT') {
    if (currentUser.role === 'TEAMMEMBER') {
      filter = {
        target_team: {
          id: currentUser.team?.id,
        },
        user: {
          id: currentUser.id,
        },
      };
    } else if (currentUser.role === 'TEAMLEADER') {
      filter = {
        target_team: ['id', currentUser.access_team],
        issuer_team: {
          id: currentUser.team?.id,
        },
        user: {
          id: currentUser?.id,
        },
      };
    } else if (currentUser.role === 'CHEF') {
      filter = {
        departement: [
          'id',
          currentUser.departements.map((depart: any) => depart.id),
        ],
        user: {
          id: currentUser.id,
        },
      };
    }
    queryParams = {
      read: currentUser?.id ?? 0,
      access_entity: currentUser?.access_entity ?? [],
      filter,
      sortField: 'updatedAt',
      sortOrder: 'desc',
      access_team: currentUser?.access_team ?? [],
      assigned_to: ['TEAMLEADER', 'CHEF'].includes(currentUser.role)
        ? null
        : currentUser.id,
    };
  } else if (
    currentUser.role === ROLE.ADMIN ||
    currentUser.role === ROLE.SUPERADMIN
  ) {
    queryParams = {
      access_entity: [],
      access_team: [],
      filter: {},
      pageNumber: 1,
      pageSize: 10,
      read: currentUser?.id ?? 0,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    };
  }

  // get tickets
  const {refetch} = useQuery<number[], unknown, {ids: number[]}>(
    'ids',
    async () => {
      if (
        currentUser != null &&
        (currentUser.role === ROLE.ADMIN ||
          currentUser.role === ROLE.SUPERADMIN)
      ) {
        return await transport
          .post(
            '/mobile/tickets/admin/ids',
            {
              queryParams,
            },
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            },
          )
          .then(res => res.data);
      } else if (currentUser != null && currentUser.user_type === 'PROD') {
        return await transport
          .post(
            '/mobile/tickets/prod/ids',
            {queryParams},
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            },
          )
          .then(res => res.data);
      } else if (currentUser != null && currentUser.user_type === 'SUPPORT') {
        return await transport
          .post(
            '/mobile/tickets/tech/ids',
            {
              queryParams,
            },
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .then(res => res.data);
      }
    },
    {
      onSuccess: data => {
        if (data == null) {
          setData([]);
        } else {
          setData(data.ids);
        }
      },
      onError: err => {
        console.log(err);
      },
    },
  );

  /* A function that is called when a new ticket is created. */
  useEffect(() => {
    socket.on('tickets-updated', async () => {
      await refetch();
    });
    socket.on('ticket-forwarded', async () => {
      await refetch();
    });

    // loop throught tickets and create socket connection for each ticket when it is updated and when new message is added
    if (ids != null) {
      for (const id of ids) {
        socket.on(`ticket-updated-${id}`, async (status: string) => {
          // Request permissions (required for iOS)
          // await notifee.requestPermission();

          // Create a channel (required for Android)
          const channelId = await notifee.createChannel({
            id: 'Default',
            name: 'Default Channel',
          });
          await notifee.displayNotification({
            title: 'My Ticket',
            body: `Ticket ${id} is ${status}`,
            android: {
              channelId,
              // pressAction is needed if you want the notification to open the app when pressed
              pressAction: {
                id: 'default',
              },
            },
          });
          await refetch();
        });
        socket.on(`messageCreated-${id}`, async () => {
          // Request permissions (required for iOS)
          // await notifee.requestPermission();
          // Create a channel (required for Android)
          const channelId = await notifee.createChannel({
            id: 'Default',
            name: 'Default Channel',
          });
          await notifee.displayNotification({
            title: 'My Ticket',
            body: `You have a New Message (#${id})`,
            android: {
              channelId,
              // pressAction is needed if you want the notification to open the app when pressed
              pressAction: {
                id: 'default',
              },
            },
          });
          await refetch();
        });
      }
    }

    refetch();
    /* Removing the listeners for the socket. */
    return () => {
      socket.off('ticket-forwarded');
      socket.off('tickets-updated');
      if (ids != null) {
        for (const id of ids) {
          socket.off(`ticket-updated-${id}`);
          socket.off(`messageCreated-${id}`);
        }
      }
    };
  }, [ids, refetch]);

  useQuery<
    any,
    unknown,
    {
      OpenCount: number;
      CloseCount: number;
      ResolveCount: number;
      ProgresCount: number;
      ReOpenCount: number;
    }
  >(
    'ticketCount',
    async () => {
      if (
        currentUser != null &&
        (currentUser.role === ROLE.ADMIN ||
          currentUser.role === ROLE.SUPERADMIN)
      ) {
        return await transport
          .post('/mobile/tickets/count/admin', {queryParams})
          .then(res => res.data);
      } else if (currentUser != null && currentUser.user_type === 'PROD') {
        return await transport
          .post('/mobile/tickets/count/prod', {queryParams})
          .then(res => res.data);
      } else if (currentUser != null && currentUser.user_type === 'SUPPORT') {
        return await transport
          .post('/mobile/tickets/count/tech', {queryParams})
          .then(res => res.data);
      }
    },
    {
      onSuccess: data => {
        setTicketsGlobal({
          closedCount: data.CloseCount,
          inProgressCount: data.ProgresCount,
          openCount: data.OpenCount,
          reopenCount: data.ReOpenCount,
          resolvedCount: data.ResolveCount,
        });
      },
    },
  );

  // for show badge count
  const filterdTicketsResolved = ticketsGlobl.resolvedCount;
  const filterdTicketsOpened = ticketsGlobl.openCount;
  const filterdTicketsReOpened = ticketsGlobl.reopenCount;
  const filterdTicketsProgress = ticketsGlobl.inProgressCount;
  const filterdTicketsClosed = ticketsGlobl?.closedCount;

  return (
    <View style={styles.container}>
      <MaterialTopTabs.Navigator
        screenOptions={{
          lazy: true,
          animationEnabled: Platform.OS === 'android' ? true : false,
          tabBarStyle: {paddingVertical: 8},
        }}>
        <MaterialTopTabs.Screen
          name="ReOpenScreen"
          component={ReOpenTickets}
          options={{
            lazy: true,
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <IconOpen size={20} name={'issue-reopened'} color={'orange'} />
            ),
            tabBarBadge: () =>
              filterdTicketsReOpened! > 0 ? (
                <Badge style={styles.badgeReo}>
                  {filterdTicketsReOpened! > 100
                    ? '+99'
                    : filterdTicketsReOpened}
                </Badge>
              ) : undefined,
          }}
        />
        <MaterialTopTabs.Screen
          name="OpenScreen"
          component={OpenTickets}
          options={{
            lazy: true,
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <IconOpen size={20} name={'issue-opened'} color={'blue'} />
            ),
            tabBarBadge: () =>
              filterdTicketsOpened! > 0 ? (
                <Badge>
                  {filterdTicketsOpened! > 100 ? '+99' : filterdTicketsOpened}
                </Badge>
              ) : undefined,
          }}
        />
        <MaterialTopTabs.Screen
          name="ProgressScreen"
          component={ProgressTickets}
          options={{
            lazy: true,
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <Icon size={20} name={'clockcircle'} color={'blue'} />
            ),
            tabBarBadge: () =>
              filterdTicketsProgress! > 0 ? (
                <Badge style={styles.badgePro}>
                  {filterdTicketsProgress! > 100
                    ? '+99'
                    : filterdTicketsProgress}
                </Badge>
              ) : undefined,
          }}
        />
        <MaterialTopTabs.Screen
          name="ResolvedScreen"
          component={ResolvedTickets}
          options={{
            lazy: true,
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <Icon size={20} name={'checkcircle'} color={'green'} />
            ),
            tabBarBadge: () =>
              filterdTicketsResolved! > 0 ? (
                <Badge style={styles.badgeRes}>
                  {filterdTicketsResolved! > 100
                    ? '+99'
                    : filterdTicketsResolved}
                </Badge>
              ) : undefined,
          }}
        />
        <MaterialTopTabs.Screen
          name="ClosedScreen"
          component={ClosedTickets}
          options={{
            lazy: true,
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <Icon size={20} name={'closecircle'} color={'red'} />
            ),
            tabBarBadge: () =>
              filterdTicketsClosed! > 0 ? (
                <Badge style={styles.badgeClo}>
                  {filterdTicketsClosed! > 100 ? '+99' : filterdTicketsClosed}
                </Badge>
              ) : undefined,
          }}
        />
      </MaterialTopTabs.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7ff',
    height: '100%',
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
    backgroundColor: COLORS.blue,
  },
  mainCardView: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8cc9ffba',
    borderRadius: 15,
    shadowColor: 'shadow',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'column',
  },
  headerView: {
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // ...SHADOW,
    height: 80,
  },
  headerAction: {
    display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // width: '100%',
    // height: 100,
  },
  button: {
    padding: 12,
  },
  picker: {
    // width: '40%',
    marginTop: 2,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 8,
    // padding: 0,
    backgroundColor: COLORS.white,
    color: COLORS.blue,
    borderWidth: 0,
    // height: 40,
  },
  searchBar: {
    marginLeft: '4%',
    marginRight: '4%',
    marginBottom: '2%',
    marginTop: '2%',
    borderRadius: 0,
    paddingHorizontal: 16,
    ...SHADOW,
    backgroundColor: '#fff',
    fontSize: 16,
    height: Platform.OS === 'ios' ? 50 : 50,
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 'larger',
    fontWeight: 'bold',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    borderWidth: 0,
  },
  searchBarDark: {
    marginLeft: '4%',
    marginRight: '4%',
    marginBottom: '2%',
    marginTop: '2%',
    borderRadius: 0,
    paddingHorizontal: 16,
    ...SHADOW,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
    height: Platform.OS === 'ios' ? 50 : 50,
  },
  Message: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  textNOData: {
    color: '#c4c7cb',
    fontSize: 30,
  },
  badgeRes: {backgroundColor: 'green'},
  badgePro: {backgroundColor: 'blue'},
  badgeClo: {backgroundColor: '#d9d9d9'},
  badgeReo: {backgroundColor: 'orange'},
});

export default Tickets;
