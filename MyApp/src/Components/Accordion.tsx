/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, View, Text, Alert, useColorScheme} from 'react-native';
import {COLORS, SHADOW, SHADOWIOS} from '../utils/theme';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from 'react-query';
import React from 'react';
import {Key} from 'react';
import {Ticket, TICKET_STATUS} from '../types';
import {Badge, Button, Chip, List} from 'react-native-paper';
import transport from '../utils/Api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-simple-toast';
import dayjs from 'dayjs';

import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import useUsersAtom from '../context/contextUser';
import {socket} from '../context/socket.provider';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz('Africa/Casablanca');

export const Accordion: React.FC<{
  navigation: any;
  data: Ticket;
  refetch?: (
    options?: (RefetchOptions & RefetchQueryFilters<any>) | undefined,
  ) => Promise<QueryObserverResult<{entities: Ticket[]}, unknown>>;
}> = ({data, navigation}) => {
  const [currentUser] = useUsersAtom();
  let ticketId = data.id;
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const updateMutation = useMutation<
    any,
    unknown,
    {ids: Key[]; status: TICKET_STATUS}
  >(
    async ({ids, status}) => {
      // get token and split it
      //const authToken = await AsyncStorage.getItem('authToken');
      //const accessToken = authToken?.split('.').slice(0, 2).join('.');
      //const jid = authToken?.split('.').pop();
      await transport
        .post(
          '/tickets/updateStatusForTickets',
          {
            ids,
            status,
            assigned_to: currentUser?.id ?? null,
            closed_by: currentUser?.name,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              // pass cookie to headers
              //cookie: `tickets_access_token=${accessToken}; tickets_jid_admin=${jid}`,
            },
          },
        )
        .then(res => res.data);
    },
    {
      onSuccess: async () => {
        socket.emit('updatedTicket', ticketId);
        // refetch();
        Toast.show('Tickets has been updated.', Toast.SHORT);
      },
      onError: async () => {
        Toast.show('Error Updating.', Toast.SHORT);
      },
    },
  );

  function renderStatus(status: TICKET_STATUS) {
    switch (status) {
      case TICKET_STATUS.In_Progress:
        return (
          <Chip style={{backgroundColor: '#91d5ff'}}>
            {TICKET_STATUS.In_Progress}
          </Chip>
        );
      case TICKET_STATUS.Open:
        return (
          <Chip style={{backgroundColor: '#f5222d'}}>{TICKET_STATUS.Open}</Chip>
        );
      case TICKET_STATUS.Reopened:
        return (
          <Chip style={{backgroundColor: '#ffa940'}}>
            {TICKET_STATUS.Reopened}
          </Chip>
        );
      case TICKET_STATUS.Resolved:
        return (
          <Chip style={{backgroundColor: '#b7eb8f'}}>
            {TICKET_STATUS.Resolved}
          </Chip>
        );
      case TICKET_STATUS.Closed:
        return (
          <Chip style={{backgroundColor: '#ffa39e'}}>
            {TICKET_STATUS.Closed}
          </Chip>
        );
    }
  }

  // alert to confirm btn status
  const InProgressButtonAlert = (state: TICKET_STATUS) =>
    Alert.alert(
      'Are you sure ?',
      'Are you sure you want to change this state?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            updateMutation.mutate({
              ids: [ticketId],
              status: state,
            });
          },
        },
      ],
    );
  const theme = useColorScheme();

  return (
    <List.Section style={styles.container}>
      <List.Accordion
        title={`#${data.id} `}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        right={props => {
          return (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
              }}>
              {renderStatus(data.status)}
              <Chip
                style={{
                  backgroundColor: '#91d500',
                  display: 'flex',
                  marginRight: 10,
                }}>
                <Text> {dayjs(data.createdAt).format('YYYY-MM-DD')}</Text>
              </Chip>
            </View>
          );
        }}
        descriptionStyle={styles.descstyle}
        description={
          <View>
            {data.unread === 0 ? null : (
              <Badge size={20}>{data.unread < 10 ? data.unread : '+10'}</Badge>
            )}
          </View>
        }
        titleStyle={{color: COLORS.black}}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          position: 'relative',
          zIndex: 9,
          ...styles.accordion.header,
          ...SHADOW,
        }}
        expanded={expanded}
        onPress={handlePress}>
        <View
          style={
            theme === 'light'
              ? styles.accordion.content
              : styles.accordionDark.contentDark
          }>
          <View style={styles.accordion.content.box}>
            {data.status === TICKET_STATUS.Closed ? (
              <>
                {/* <Text>Closed By</Text>
              <Chip>{data.closed_by}</Chip> */}
                <View style={styles.items}>
                  <Icon
                    name="person"
                    size={20}
                    style={styles.iconClosed}
                    color={'#91d5ff'}
                  />

                  <List.Item
                    title={data.closed_by}
                    centered={true}
                    titleStyle={{color: COLORS.red}}
                  />
                </View>
              </>
            ) : null}

            <View style={styles.items}>
              <Icon name="person" size={20} style={styles.icon} />

              <List.Item
                title={data.user.name}
                centered={true}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon name="device-hub" size={20} style={styles.icon} />
              <List.Item
                title={data.entity?.name}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon name="domain" size={20} style={styles.icon} />
              <List.Item
                title={data.departement.name}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon name="fact-check" size={20} style={styles.icon} />
              <List.Item
                title={data.status}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon name="access-time" size={20} style={styles.icon} />
              <List.Item
                title={dayjs(`${data.createdAt}`)
                  .add(1, 'hour')
                  .format('YYYY/MM/DD HH:mm:ss')}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon name="access-time" size={20} style={styles.icon} />
              <List.Item
                title={dayjs(data.updatedAt)
                  .add(1, 'hour')
                  .format('YYYY/MM/DD HH:mm:ss')}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon
                name="subject"
                color={COLORS.black}
                size={20}
                style={styles.icon}
              />
              <List.Item
                title={data.subject}
                titleStyle={{color: COLORS.black}}
              />
            </View>
            <View style={styles.items}>
              <Icon
                name="groups"
                color={COLORS.black}
                size={20}
                style={styles.icon}
              />
              <List.Item
                title={data.target_team.name}
                titleStyle={{color: COLORS.black}}
              />
            </View>
          </View>
        </View>
        <Button
          onPress={() =>
            navigation.push('Chat', {
              ticketId: data.id,
              tickets: data,
            })
          }
          style={styles.accordion.content.chat}
          color={'white'}>
          <Text>Let's Chat</Text>
        </Button>
        <View style={styles.statusStyle}>
          {currentUser.user_type === 'SUPPORT' ? (
            <>
              <Button
                style={styles.accordion.content.actions.btnProgress}
                onPress={() => InProgressButtonAlert(TICKET_STATUS.In_Progress)}
                color={'#1890ff'}>
                <Text style={styles.accordion.content.actions.btnProgress.text}>
                  InProgress
                </Text>
              </Button>
              <Button
                style={styles.accordion.content.actions.btnResolved}
                onPress={() => InProgressButtonAlert(TICKET_STATUS.Resolved)}
                color={'#7cb305'}>
                <Text style={styles.accordion.content.actions.btnResolved.text}>
                  Resolved{' '}
                </Text>
              </Button>
              <Button
                style={styles.accordion.content.actions.btnClose}
                onPress={() => InProgressButtonAlert(TICKET_STATUS.Closed)}
                color={'#cf1322'}>
                <Text style={styles.accordion.content.actions.btnClose.text}>
                  Close
                </Text>
              </Button>
            </>
          ) : null}
        </View>
      </List.Accordion>
    </List.Section>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: COLORS.white,
    ...SHADOWIOS,
    marginHorizontal: '2%',
  },
  accordion: {
    width: '96%',
    marginHorizontal: '2%',
    header: {
      height: 'auto',
      backgroundColor: '#fff',
      borderRadius: 8,
      icon: {
        padding: 0,
        marginHorizontal: 4,
        borderLeftColor: COLORS.blue,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
      },
    },
    content: {
      width: '96%',
      minHeight: 150,
      marginHorizontal: '2%',
      marginVertical: '1%',
      backgroundColor: COLORS.white,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      box: {
        padding: 8,
        paddingTop: 16,
      },
      chat: {
        backgroundColor: COLORS.blue,
        marginTop: 16,
        marginLeft: 6,
        marginRight: 6,
      },
      actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        btnResolved: {
          margin: 3,
          width: '30.4%',
          textAlign: 'center',
          text: {
            fontSize: 11,
          },
          backgroundColor: '#b7eb8f',
        },
        btnProgress: {
          margin: 3,
          marginLeft: 6,
          width: '33%',
          textAlign: 'center',
          text: {
            fontSize: 11,
          },
          backgroundColor: '#91d5ff',
        },
        btnClose: {
          margin: 3,
          width: '30%',
          textAlign: 'center',
          text: {
            fontSize: 11,
          },
          backgroundColor: '#ffa39e',
        },
      },
    },
  },
  Text: {fontWeight: 'bold', paddingLeft: 8},
  Chip: {
    backgroundColor: '#91d5ff',
    fontWeight: 'bold',
  },
  title: {
    paddingLeft: 8,
    fontWeight: 'bold',
    flexGrow: 1,
    width: 150,
    flexWrap: 'wrap',
  },
  titleView: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
  },
  badge: {
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  items: {
    display: 'flex',
    marginHorizontal: 16,
    backgroundColor: COLORS.transparentBlue,
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  accordionDark: {
    width: '96%',
    marginHorizontal: '2%',
    header: {
      height: 'auto',
      backgroundColor: '#fff',
      borderRadius: 8,
      icon: {
        padding: 0,
        marginHorizontal: 4,
        borderLeftColor: COLORS.blue,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
      },
    },
    contentDark: {
      width: '96%',
      minHeight: 150,
      marginHorizontal: '2%',
      backgroundColor: COLORS.white,
      color: COLORS.black,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
  TextDark: {fontWeight: 'bold', paddingLeft: 8, color: COLORS.black},
  ChipDark: {
    backgroundColor: '#91d5ff',
    fontWeight: 'bold',
    color: COLORS.black,
  },
  titleDark: {
    paddingLeft: 8,
    fontWeight: 'bold',
    flexGrow: 1,
    width: 150,
    flexWrap: 'wrap',
    color: COLORS.black,
  },
  titleViewDark: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
  },
  badgeDark: {
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  itemsDark: {
    display: 'flex',
    marginHorizontal: 16,
    backgroundColor: COLORS.transparentBlue,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  descstyle: {position: 'absolute', bottom: 0, right: 0},
  icon: {
    position: 'absolute',
    color: COLORS.blueSky,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconClosed: {
    position: 'absolute',
    color: COLORS.red,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statusStyle: {display: 'flex', flexDirection: 'row'},
});
