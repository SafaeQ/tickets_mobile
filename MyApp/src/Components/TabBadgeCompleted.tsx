import React from 'react';
import {Badge} from 'react-native-paper';
import {useQuery} from 'react-query';
import useUsersAtom from '../context/contextUser';
import {Topic, TopicStatus} from '../types';
import transport from '../utils/Api';

const TabBadgeCompleted = () => {
  const [currentUser] = useUsersAtom();

  const {data: topics} = useQuery<Topic[]>(
    'topics',
    async () =>
      await transport
        .get(`/mobile/conversations/topics/${currentUser?.id ?? 0}`)
        .then(res => res.data),
  );

  return (
    <Badge>
      {topics?.filter((t: Topic) => t.status === TopicStatus.COMPLETED).length}
    </Badge>
  );
};
export default TabBadgeCompleted;
