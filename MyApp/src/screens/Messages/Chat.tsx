import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Chip, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useQuery} from 'react-query';
import Loading from '../../Components/Loading';
import useUsersAtom from '../../context/contextUser';
import {socket} from '../../context/socket.provider';
import {ChatType, ROLE, Topic} from '../../types';
import transport from '../../utils/Api';
import {COLORS} from '../../utils/theme';
import Conversation from './Conversation/conversation';

const fullScreenWidth = Dimensions.get('window').width;

type ChatParamList = {
  params: {
    topic: Topic;
  };
};
type ChatScreenRouteProp = RouteProp<ChatParamList, 'params'>;

const Chat = () => {
  const route = useRoute<ChatScreenRouteProp>();
  let topic = route.params.topic;

  const [textMessage, setMessage] = React.useState('');
  const [conversationData, setConversationData] = React.useState<ChatType[]>(
    [],
  );
  const chatEnd = React.useRef(null);
  const [currentUser] = useUsersAtom();

  /* A react-query hook that is fetching the chat messages from the server. */
  const {refetch, isLoading} = useQuery<ChatType[]>(
    ['chatMessages', topic],
    async () =>
      await transport
        .get(`/mobile/conversations?topic=${topic?.id}&me=${currentUser?.id}`)
        .then(res => res.data),
    {
      enabled: Number.isInteger(topic?.id),
      refetchInterval: 2000,
      onSuccess: data => {
        if (data != null) {
          setConversationData(data);
        }
      },
    },
  );

  const submitMessage = () => {
    const body = textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, '');
    const newMessage = {
      msg: textMessage.replace(/$\s+|^\s+|^\n+|\n+$/g, ''),
      from: currentUser?.id,
      to: topic.to.id !== currentUser?.id ? topic.from.id : topic.to.id,
      topic: topic.id,
    };
    if (body.length > 0 && body.replace(/\s/g, '').length > 0) {
      socket.emit('send:message', newMessage);
      setMessage('');
    }
  };

  /* This is a react hook that is called when the component is mounted. It is subscribing to the socket
  event `received:message` and when the event is triggered, it is playing a sound and refetching the
  chat messages. */
  React.useEffect(() => {
    socket.on('received:message', async (message: ChatType) => {
      console.log('message received');
      if (message.to.id === currentUser?.id) {
        await refetch();
      }
    });
    socket.on('message:sent', async () => {
      await refetch();
      console.log('message sent');
    });
    return () => {
      console.log('conversation unsubscribe');
      socket.removeListener('received:message');
      socket.removeListener('message:sent');
    };
  }, [currentUser?.id, refetch]);

  // const moveAnimation = useRef(new Animated.Value(0)).current;
  // const animate = () => {
  //   Animated.loop(
  //     Animated.timing(moveAnimation, {
  //       toValue: -Dimensions.get('window').width,
  //       duration: 6000,
  //       useNativeDriver: false,
  //     }),
  //   ).start();
  // };
  // const animatedStyle = {
  //   transform: [
  //     {
  //       translateX: moveAnimation,
  //     },
  //   ],
  // };
  // useEffect(() => {
  //   animate();
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.ViewChip} />
          <Chip style={styles.chip}>{topic?.id}</Chip>
          <ScrollView horizontal={true}>
            <Text style={styles.text}>
              {topic?.from.name} - {topic?.to.name}
            </Text>
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {isLoading ? (
          <Loading />
        ) : (
          <Conversation topic={topic} conversationData={conversationData} />
        )}
        <View ref={chatEnd} />
      </ScrollView>
      {currentUser &&
      (currentUser.role === ROLE.ADMIN ||
        currentUser.role === ROLE.SUPERADMIN) &&
      currentUser.id !== topic.from.id &&
      currentUser.id !== topic.to.id ? null : (
        <TouchableOpacity style={styles.viewBottom}>
          <TextInput
            onChangeText={text => setMessage(text)}
            value={textMessage}
            style={styles.input}
            placeholder="Type message"
            placeholderTextColor={COLORS.grey}
          />
          <Button
            onPress={submitMessage}
            color={'green'}
            mode="text"
            style={styles.buttonSubmit}>
            <Icon name="send" size={20} />
          </Button>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7ff',
  },
  innerContainer: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    // paddingVertical: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    width: 'auto',
  },
  scroll: {
    height: '60%',
    marginBottom: 16,
    width: '100%',
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    transform: [{scaleY: -1}],
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    width: '75%',
    borderTopLeftRadius: 50,
    color: 'black',
    // ...SHADOW,
  },
  buttonSubmit: {
    justifyContent: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    margin: 10,
  },
  buttonText: {color: '#fff'},
  viewBottom: {
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 12,
    marginLeft: 12,
    marginRight: 12,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    //margin: 8,
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: 'black',
    width: fullScreenWidth,
    marginBottom: 10,
    //borderRadius: 50,
    // transform: [{translateX: 90}, {translateY: 0}],
  },
  mainHeader: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    width: 'auto',
    paddingBottom: 12,
  },
  text: {
    fontWeight: 'bold',
    color: COLORS.white,
    paddingLeft: 50,
    width: '100%',
    animation: 'marquee 5s linear infinite',
  },
  ViewChip: {
    backgroundColor: COLORS.blue,
    width: 20,
    position: 'absolute',
    height: 20,
    zIndex: 5,
  },
  chip: {
    color: 'black',
    position: 'absolute',
    left: 10,
    top: 5,
    zIndex: 5,
  },
});
export default Chat;
