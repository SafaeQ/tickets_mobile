import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useMutation} from 'react-query';
import useUsersAtom from '../context/contextUser';
import {Topic, TopicStatus} from '../types';
import transport from '../utils/Api';
import {COLORS} from '../utils/theme';

type ChatParamList = {
  params: {
    topic: Topic;
  };
};
type ChatScreenRouteProp = RouteProp<ChatParamList, 'params'>;

const StatusBtn = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  let topic = route.params.topic;
  const [currentUser] = useUsersAtom();
  const [openMenu, setOpenMenu] = React.useState(false);

  const updateTopicMutation = useMutation(
    async ({status, updatedby}: {status: string; updatedby: number | null}) =>
      await transport
        .put(`/mobile/conversations/topics/update/${topic.id}`, {
          status,
          updatedby,
        })
        .then(res => res.data),
    {
      onSuccess: async () => {
        console.log('Topic Updated');
        // onSelectTopic(null);
        setOpenMenu(false);
        navigation.goBack();
      },
      onError: async () => {
        console.log('Error Updating');
      },
    },
  );

  return (
    <SafeAreaView>
      <Menu
        visible={openMenu}
        onDismiss={() => {
          setOpenMenu(false);
        }}
        anchor={
          <View>
            <Icon
              name="more-vert"
              onPress={() => {
                return setOpenMenu(true);
              }}
              size={30}
              color={COLORS.white}
            />
          </View>
        }>
        <Menu.Item
          title="Reopen"
          disabled={topic?.status === TopicStatus.OPEN}
          onPress={() => {
            updateTopicMutation.mutate({
              status: TopicStatus.OPEN,
              updatedby: currentUser?.id ?? null,
            });
          }}
        />
        <Menu.Item
          title=" Mark as Completed"
          onPress={() => {
            updateTopicMutation.mutate({
              status: TopicStatus.COMPLETED,
              updatedby: currentUser?.id ?? null,
            });
          }}
          disabled={topic?.status === TopicStatus.COMPLETED}
        />
      </Menu>
    </SafeAreaView>
  );
};

export default StatusBtn;
