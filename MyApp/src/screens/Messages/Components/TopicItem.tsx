import React, {FC} from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Avatar, Badge, Button} from 'react-native-paper';
import IconS from 'react-native-vector-icons/MaterialCommunityIcons';
import Subject from 'react-native-vector-icons/MaterialIcons';
import {Topic} from '../../../types';
import {COLORS, SHADOW, SHADOWIOS} from '../../../utils/theme';
import LinearGradient from 'react-native-linear-gradient';
import dayjs from 'dayjs';

const fullScreenWidth = Dimensions.get('screen').width;

const TopicItem: FC<{
  selectedSectionId: number;
  topic: Topic;
  navigation: any;
  onSelectTopic: React.Dispatch<React.SetStateAction<Topic | null>>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({topic, selectedSectionId, onSelectTopic, navigation}) => {
  return (
    <View>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#ffff', '#ffff', '#65a0e5']}
          end={{x: 0, y: 1.3}}
          style={styles.item}>
          <View style={styles.ViewItem}>
            <View style={styles.View}>
              <Avatar.Text
                size={40}
                label={`${topic.id}`}
                style={{backgroundColor: COLORS.blue}}
                color={COLORS.white}
              />
            </View>
            <View style={styles.BigItem}>
              <View style={styles.smallItems}>
                <IconS name="export" size={20} color={COLORS.blueSky} />
                <Text style={styles.TextName}>{topic?.from?.name}</Text>
              </View>
              <View style={styles.smallItems}>
                <IconS name="import" size={20} color={COLORS.blueSky} />
                <Text style={styles.TextName}>{topic?.to?.name}</Text>
              </View>
              <View style={styles.smallItems}>
                <Subject name="subject" size={20} color={COLORS.blueSky} />
                <Text style={styles.TextName}>{topic?.subject}</Text>
              </View>
              <View style={styles.smallItems}>
                <IconS
                  name="clock-time-eight-outline"
                  size={20}
                  color={COLORS.blueSky}
                />
                <Text style={styles.TextName}>
                  {dayjs(topic.createdAt)
                    .add(1, 'hour')
                    .format('DD/MM/YYYY HH:mm:ss')}
                </Text>
              </View>
              <View style={styles.ViewBtn}>
                {topic?.unreadMessages !== 0 && topic.unreadMessages > 0 ? (
                  <View style={styles.badge}>
                    <Badge>
                      {topic.unreadMessages < 10 ? topic.unreadMessages : '+10'}
                    </Badge>
                  </View>
                ) : null}
                <Button
                  style={styles.button}
                  mode="outlined"
                  color={COLORS.blue}
                  onPress={() => {
                    navigation.push('msg', {
                      topic: topic,
                    });
                  }}>
                  <IconS name="wechat" size={30} />
                </Button>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  item:
    Platform.OS === 'ios'
      ? {
          marginTop: 10,
          backgroundColor: 'white',
          marginHorizontal: 12,
          marginVertical: 2,
          paddingHorizontal: 12,
          paddingVertical: 12,
          ...SHADOWIOS,
          borderRadius: 8,
        }
      : {
          marginTop: 10,
          backgroundColor: 'white',
          marginHorizontal: 12,
          marginVertical: 2,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: COLORS.black,
          ...SHADOW,
          borderRadius: 8,
        },
  ViewItem: {
    display: 'flex',
    flexDirection: 'row',
    color: COLORS.black,
  },
  TextName: {
    fontWeight: '500',
    fontSize: 16,
    color: COLORS.black,
    paddingLeft: 2,
  },
  ViewText: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    color: COLORS.black,
  },
  main1: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 12,
    color: COLORS.black,
  },
  View: {paddingRight: 12},
  smallItems: {
    backgroundColor: '#f2f6f7',
    borderRadius: 5,
    margin: 3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
  },
  BigItem: {width: fullScreenWidth / 1.4, paddingTop: 10},
  badge: {position: 'absolute', left: 96, top: -3},
  button: {
    width: 100,
    alignSelf: 'center',
  },
  ViewBtn: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
export default TopicItem;
