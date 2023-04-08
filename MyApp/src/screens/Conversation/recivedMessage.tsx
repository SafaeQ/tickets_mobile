import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {TicketMessage} from '../../types';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import {COLORS} from '../../utils/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Toast from 'react-native-simple-toast';

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz('Africa/Casablanca');

const downloadURL =
  process.env.NODE_ENV === 'production'
    ? 'http://65.108.50.157:4001'
    : 'http://10.192.0.19:4001';

type RootStackParamList = {
  showFullImage: {img: string} | undefined;
};

const ReceivedMessageCell = ({conversation}: {conversation: TicketMessage}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const renderMessage = () => {
    if (conversation.body.startsWith('image:')) {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('showFullImage', {
              img: `${downloadURL}/${conversation.body.split(':')[1]}`,
            });
          }}>
          <Image
            style={{width: 100, height: 50}}
            source={{uri: `${downloadURL}/${conversation.body.split(':')[1]}`}}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(`${conversation.body}`);
          Toast.show('Text copied');
        }}
        key={conversation.id}>
        <Text style={{color: COLORS.black}} key={conversation.id}>
          {conversation.body}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.chat} key={conversation.id}>
      <View style={styles.conversation} key={conversation.id}>
        <Text style={styles.text} selectable={true}>
          {conversation.user.name}
        </Text>
        <View style={styles.msg}>
          <View key={conversation.id}>{renderMessage()}</View>
          <View style={styles.chatTime}>
            <Text style={styles.time} selectable={true}>
              {dayjs(conversation.createdAt)
                .add(1, 'hour')
                .format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  chat: {
    display: 'flex',
    marginBottom: 12,
    width: '100%',
    color: COLORS.black,
    alignItems: Platform.OS === 'ios' ? 'flex-end' : 'flex-start',
  },

  text:
    Platform.OS === 'ios'
      ? {fontWeight: 'bold', marginTop: 5, color: COLORS.black, marginRight: 10}
      : {fontWeight: 'bold', marginTop: 5, color: COLORS.black, marginLeft: 10},
  conversation: {
    borderRadius: 50,
    borderTopRightRadius: Platform.OS === 'ios' ? 0 : 16,
    borderTopLeftRadius: Platform.OS === 'ios' ? 16 : 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#fff',
    color: COLORS.black,
    // height: 100,
    width: '62%',
  },
  msg: {
    justifyContent: 'center',
    paddingLeft: 16,
    color: COLORS.black,
    paddingTop: 5,
    paddingBottom: 32,
    paddingRight: 16,
  },
  chatTime:
    Platform.OS === 'ios'
      ? {
          position: 'absolute',
          color: COLORS.black,
          bottom: 4,
          left: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }
      : {
          position: 'absolute',
          color: COLORS.black,
          bottom: 4,
          right: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
  time: {color: 'gray', fontSize: 12},
  // avatar: {position: 'relative', bottom: 10, margin: 2},
});
export default ReceivedMessageCell;
