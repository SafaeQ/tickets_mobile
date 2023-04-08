import React, {FC, useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {User} from '../../../types';
import {Avatar, Text} from 'react-native-paper';
import {SHADOW, SHADOWIOS, COLORS} from '../../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CreateTopic from './CreateTopic';

const ContactItem: FC<{
  selectedSectionId: number;
  user: User;
  navigation: any;
}> = ({user, navigation}) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <View>
      <CreateTopic
        recepient={user}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        navigation={navigation}
      />
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            setIsVisible(true);
          }}>
          <View style={styles.ViewItem}>
            <Avatar.Icon
              size={40}
              icon={() => <Icon name="person" size={20} color={COLORS.white} />}
              style={{backgroundColor: COLORS.blue}}
            />
            <Text style={styles.TextItem}>{user.name}</Text>
          </View>
        </TouchableOpacity>
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
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          ...SHADOWIOS,
        }
      : {
          marginTop: 10,
          backgroundColor: 'white',
          marginHorizontal: 12,
          marginVertical: 2,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: COLORS.black,
          ...SHADOW,
        },
  ViewItem: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  TextItem: {
    paddingLeft: 12,
    paddingTop: 8,
    fontSize: 18,
    color: COLORS.black,
  },
});
export default ContactItem;
