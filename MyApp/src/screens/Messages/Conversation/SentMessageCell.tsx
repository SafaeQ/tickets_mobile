import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import dayjs from 'dayjs';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import {ChatType} from '../../../types';
import {COLORS} from '../../../utils/theme';
import Toast from 'react-native-simple-toast';

const downloadURL =
  process.env.NODE_ENV === 'production'
    ? 'http://65.108.50.157:4001'
    : 'http://10.192.0.19:4001';

type RootStackParamList = {
  showFullImage: {img: string} | undefined;
};

const SentMessageCell = ({conversation}: {conversation: ChatType}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const renderMessage = () => {
    if (conversation.msg.startsWith('image:')) {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('showFullImage', {
              img: `${downloadURL}/${conversation.msg.split(':')[1]}`,
            });
          }}>
          <Image
            resizeMode="contain"
            style={styles.img}
            source={{uri: `${downloadURL}/${conversation.msg.split(':')[1]}`}}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(`${conversation.msg}`);
          Toast.show('Text copied');
        }}
        key={conversation.id}>
        <Text
          key={conversation.id}
          style={{color: COLORS.black}}
          selectable={true}>
          {conversation.msg}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.chat} key={Math.random()}>
      <View style={styles.conversation}>
        <View style={styles.msg}>
          {renderMessage()}
          <Text>{conversation.read.includes(conversation.to.id)}</Text>
          <View style={styles.chatTime}>
            <Text style={styles.time}>
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
    color: COLORS.black,
    alignItems: Platform.OS === 'ios' ? 'flex-start' : 'flex-end',
  },
  conversation: {
    borderRadius: 50,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 0 : 16,
    borderBottomRightRadius: Platform.OS === 'ios' ? 16 : 0,
    backgroundColor: '#c8e8ff',
    color: 'black',
    // height: 100,
    width: '62%',
  },
  msg: {
    justifyContent: 'center',
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 20,
    color: COLORS.black,
    paddingRight: 16,
    alignItems: Platform.OS === 'ios' ? 'flex-end' : 'flex-start',
  },
  chatTime:
    Platform.OS === 'ios'
      ? {position: 'absolute', bottom: 4, left: 10, color: 'black'}
      : {position: 'absolute', bottom: 4, right: 10, color: 'black'},
  time: {color: 'gray', fontSize: 12},
  img: {width: 100, height: 100},
});
export default SentMessageCell;
