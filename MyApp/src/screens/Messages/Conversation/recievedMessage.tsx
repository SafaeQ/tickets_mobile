import {FC} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ChatType} from '../../../types';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import {COLORS} from '../../../utils/theme';
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
const ReceivedMessageCell: FC<{conversation: ChatType}> = ({conversation}) => {
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
          Toast.show('Text copied');
          Clipboard.setString(`${conversation.msg}`);
        }}
        key={conversation.id}>
        <Text style={{color: COLORS.black}} selectable={true}>
          {conversation.msg}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.chat} key={Math.random()}>
      <View style={styles.conversation}>
        <Text style={styles.text} selectable={true}>
          {conversation.from.name}
        </Text>

        <View style={styles.msg}>
          <View>{renderMessage()}</View>
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
    alignItems: 'flex-start',
    color: COLORS.black,
  },

  text: {fontWeight: 'bold', marginTop: 5, marginLeft: 5, color: 'black'},
  conversation: {
    borderRadius: 50,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#fff',
    width: '62%',
    color: 'black',
  },
  msg: {
    justifyContent: 'center',
    paddingLeft: 16,
    paddingTop: 5,
    paddingBottom: 32,
    paddingRight: 16,
    color: COLORS.black,
  },
  chatTime: {
    position: 'absolute',
    bottom: 4,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: COLORS.black,
  },
  time: {color: 'gray', fontSize: 12},
  img: {width: 100, height: 100},
});
export default ReceivedMessageCell;
