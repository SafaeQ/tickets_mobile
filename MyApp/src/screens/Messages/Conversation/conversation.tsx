import React from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import useUsersAtom from '../../../context/contextUser';
import {socket} from '../../../context/socket.provider';
import {ChatType, Topic} from '../../../types';
import ReceivedMessageCell from './recievedMessage';
import SentMessageCell from './SentMessageCell';
import {Text} from 'react-native-paper';

const Conversation: React.FC<{
  conversationData: ChatType[];
  topic: Topic;
}> = ({conversationData, topic}) => {
  const [currentUser] = useUsersAtom();

  /* Emitting a socket event to the server. */
  React.useEffect(() => {
    socket.emit('read:message', topic);
  }, [topic]);
  const emptyBoxImage = require('../../../img/chat.jpg');
  return (
    <View style={styles.chatScreen}>
      {conversationData.length === 0 ? (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image source={emptyBoxImage} style={styles.image} />
          </View>
          <View style={styles.titleView}>
            <Text style={styles.title}>No Message Yet.</Text>
          </View>
          <Text style={styles.text}>
            Once you send a message you will see it here.
          </Text>
        </View>
      ) : (
        conversationData.map((conversation, index: any) =>
          conversation.from.id === currentUser?.id ? (
            <SentMessageCell key={index} conversation={conversation} />
          ) : (
            <ReceivedMessageCell key={index} conversation={conversation} />
          ),
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatScreen: {
    transform: [{scaleY: -1}],
    padding: 5,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {color: 'balck', fontWeight: 'bold'},
  imageContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.23,
    shadowRadius: 13.97,
    elevation: 10, // required for Android
    marginBottom: 10,
  },
  text: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    color: 'grey',
    fontWeight: '300',
  },
  titleView: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  image: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  container: {
    paddingBottom: 100,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: Platform.OS === 'ios' ? '20%' : undefined,
  },
});
export default Conversation;
