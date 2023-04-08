import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {TicketMessage} from '../../types';
import {COLORS} from '../../utils/theme';
import React from 'react';
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
const SentMessageCell = ({conversation}: {conversation: TicketMessage}) => {
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
            resizeMode={'center'}
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
        <Text key={conversation.id} style={{color: COLORS.black}}>
          {conversation.body}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.chat} key={conversation.id}>
      <View style={styles.conversation}>
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
    direction: 'rtl',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 12,
    width: '100%',
    alignItems: Platform.OS === 'ios' ? 'flex-start' : 'flex-end',
    color: COLORS.black,
  },
  conversation: {
    borderRadius: 50,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 0 : 16,
    borderBottomRightRadius: Platform.OS === 'ios' ? 16 : 0,
    backgroundColor: '#c8e8ff',
    // height: 100,
    color: COLORS.black,
    width: '62%',
  },
  msg: {
    justifyContent: 'center',
    paddingLeft: 16,
    paddingTop: 16,
    color: COLORS.black,
    paddingBottom: 32,
    paddingRight: 16,
  },
  chatTime:
    Platform.OS === 'ios'
      ? {position: 'absolute', bottom: 4, left: 10}
      : {position: 'absolute', bottom: 4, right: 10},
  time: {color: 'gray', fontSize: 12},
});
export default SentMessageCell;
