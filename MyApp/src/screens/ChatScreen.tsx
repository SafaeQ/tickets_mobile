/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {useInfiniteQuery, useQueryClient} from 'react-query';
import {RouteProp, useRoute} from '@react-navigation/native';
import ReceivedMessageCell from './Conversation/recivedMessage';
import {Ticket, TicketMessage} from '../types';
import SentMessageCell from './Conversation/SentMessageCell';
import Loading from '../Components/Loading';
import {Button, Chip} from 'react-native-paper';
import transport from '../utils/Api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SHADOW, SHADOWIOS} from '../utils/theme';
import useUsersAtom from '../context/contextUser';
import {socket} from '../context/socket.provider';

type ChatStackParamList = {
  params: {ticketId: number; tickets: Ticket};
};

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'params'>;

let page = 1;
const pageSize = 50;

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const queryClient = useQueryClient();
  const [currentUser] = useUsersAtom();
  const [messages, loadMessages] = useState<TicketMessage[]>([]);
  const [textMessage, setMessage] = useState('');
  const ref = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const [searchMsg, setSearchMsg] = useState('');
  const theme = useColorScheme();

  let ticketId = route.params?.ticketId;
  let tickets = route.params.tickets;

  const {
    refetch: refetchMessages,
    isLoading,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery<
    any,
    unknown,
    {messages: TicketMessage[]; totalMsgs: number}
  >(
    'getMessages',
    async ({pageParam = page}) => {
      if (Number.isInteger(ticketId) && currentUser != null) {
        const res = await transport.get(
          `/mobile/messages/${ticketId}/${currentUser.id}?pageCurrent=${pageParam}&pageSize=${pageSize}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
        return res.data;
      }
      return [];
    },
    {
      getPreviousPageParam: firstPage => {
        if (messages?.length < firstPage.totalMsgs) {
          return page;
        }
        return undefined;
      },
      onSuccess: message => {
        if (message == null) {
          loadMessages([]);
        } else {
          ref.current = true;
          loadMessages(message.pages.flatMap(msg => msg.messages));
        }
      },
      onError: err => {
        console.log(err);
      },
    },
  );
  //  send msg by btn with scrool to btm
  const submitMessage = () => {
    const body = textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, '');
    const newMessage = {
      body: textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, ''),
      user: currentUser,
      ticket: ticketId,
    };
    if (body.length > 0 && body.replace(/\s/g, '').length > 0) {
      socket.emit('createMessage', newMessage);
      setMessage('');
    }
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  // handle search bar
  const onChangeSearch = (query: any) => setSearchMsg(query);

  useEffect(() => {
    socket.on(`messageConv-${ticketId}`, async () => {
      console.log('message created');
      await refetchMessages();
    });
    socket.on('ticket:message:sent', async () => {
      await refetchMessages();
    });
    return () => {
      ref.current = false;
      socket.off(`messageConv-${ticketId}`);
      socket.off('ticket:message:sent');
      queryClient.cancelQueries('getMessages');
    };
  }, [queryClient, refetchMessages, ticketId]);

  // Load more data
  const handleMoreData = () => {
    page++;
    fetchPreviousPage();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.mainHeader}>
          <View style={styles.header}>
            <View
              style={{
                backgroundColor: COLORS.blue,
                width: 20,
                height: 50,
                position: 'absolute',
                zIndex: 5,
              }}
            />
            <Chip
              style={{
                position: 'absolute',
                left: 10,
                top: 5,
                zIndex: 5,
              }}>
              {tickets.id}
            </Chip>
            <ScrollView horizontal={true}>
              <Text style={styles.text}>
                {tickets.user.name} - {tickets.subject}
              </Text>
            </ScrollView>
          </View>
          <TextInput
            style={theme === 'light' ? styles.searchBar : styles.searchBarDark}
            placeholder="Search..."
            placeholderTextColor={COLORS.grey}
            onChangeText={onChangeSearch}
            value={searchMsg}
            clearButtonMode="always"
          />
        </View>
        <ScrollView
          style={styles.scroll}
          alwaysBounceVertical={true}
          ref={scrollRef}>
          {isLoading === true && !ref.current ? (
            <Loading />
          ) : (
            <View style={styles.chatScreen}>
              <View style={{transform: [{scaleY: -1}]}}>
                <View>
                  <TouchableOpacity activeOpacity={0.9}>
                    {isFetchingPreviousPage === true ? (
                      <ActivityIndicator color="green" size={'large'} />
                    ) : null}
                    <Button
                      onPress={handleMoreData}
                      color={'#87CEEB'}
                      style={styles.fetch}
                      disabled={!hasPreviousPage || isFetchingPreviousPage}>
                      {' '}
                      fetch more
                    </Button>
                  </TouchableOpacity>
                </View>
                {messages
                  .filter(message =>
                    message.body
                      .toLowerCase()
                      .includes(searchMsg.toLowerCase()),
                  )
                  .map(message =>
                    message.user?.id === currentUser.id ? (
                      <View key={Math.random()}>
                        <SentMessageCell
                          key={message.id}
                          conversation={message}
                        />
                      </View>
                    ) : (
                      <View key={Math.random()}>
                        <ReceivedMessageCell
                          key={message.id}
                          conversation={message}
                        />
                      </View>
                    ),
                  )}
              </View>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.viewBottom}>
          <TextInput
            value={textMessage}
            placeholder={'Message'}
            placeholderTextColor={COLORS.grey}
            onChangeText={text => setMessage(text)}
            style={styles.input}
          />
          <Button
            onPress={submitMessage}
            color={'green'}
            mode="text"
            // loading={loading}
            style={styles.buttonSubmit}>
            <Icon name="send" size={20} />
          </Button>
        </TouchableOpacity>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7ff',
    color: COLORS.black,
    // padding: 8,
  },
  innerContainer: {
    paddingHorizontal: 10,
    marginHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
    color: COLORS.black,
  },
  scroll: {
    height: '60%',
    marginBottom: 16,
    width: '100%',
    // padding: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    // backgroundColor: '#fff',
    // ...SHADOW,
    transform: [{scaleY: -1}],
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    width: '75%',
    color: COLORS.black,
    borderTopLeftRadius: 50,
    // ...SHADOW,
  },
  lastContainer: {
    display: 'flex',
    flexDirection: 'row',
    color: COLORS.black,
    justifyContent: 'flex-end',
  },
  buttonSubmit: {
    // display: 'flex',
    justifyContent: 'center',
    // alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    color: COLORS.black,
    borderTopRightRadius: 50,
    margin: 10,
  },
  buttonText: {color: '#fff'},
  chatScreen: {
    // transform: [{scaleY: -1}],
    // backgroundColor: '#fff',
    padding: 5,
    flexGrow: 1,
    display: 'flex',
    color: COLORS.black,
    flexDirection: 'column',
    direction: 'rtl',
  },
  viewBottom: {
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 12,
    marginLeft: 12,
    color: COLORS.black,
    marginRight: 12,
  },
  Mesg: {
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.black,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: 'black',
    width: 'auto',
    paddingBottom: 10,
    paddingTop: 10,
    // transform: [{translateX: 90}, {translateY: 0}],
  },
  mainHeader: {
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    width: 'auto',
    color: COLORS.black,
    paddingBottom: 12,
  },
  text: {
    color: COLORS.white,
    fontWeight: 'bold',
    paddingLeft: 50,
    width: '100%',
    flexDirection: 'row',
  },
  ChatView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '40%',
    color: COLORS.black,
    alignSelf: 'center',
    alignContent: 'center',
    textAlign: 'center',
    padding: 10,
    margin: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    ...SHADOW,
  },
  searchBar: {
    marginLeft: '4%',
    marginRight: '4%',
    marginBottom: '2%',
    marginTop: '2%',
    borderRadius: 0,
    paddingHorizontal: 16,
    ...SHADOWIOS,
    //...SHADOW,
    backgroundColor: '#fff',
    color: COLORS.black,
    fontSize: 16,
    height: Platform.OS === 'ios' ? 50 : 50,
  },
  searchBarDark: {
    marginLeft: '4%',
    marginRight: '4%',
    marginBottom: '2%',
    marginTop: '2%',
    borderRadius: 0,
    paddingHorizontal: 16,
    ...SHADOWIOS,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  resultView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: COLORS.black,
    marginVertical: 50,
    position: 'relative',
    top: 50,
  },
  textResult: {
    color: COLORS.black,
    paddingTop: 16,
  },
  fetch: {marginLeft: '10%', marginRight: '10%', padding: 8},
});
export default ChatScreen;
