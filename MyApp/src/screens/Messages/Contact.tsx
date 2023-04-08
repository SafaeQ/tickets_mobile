import React, {useEffect, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet} from 'react-native';
import {useQuery} from 'react-query';
import ContactItem from './Components/ContactItem';
import {ROLE, User} from '../../types';
import transport from '../../utils/Api';
import Loading from '../../Components/Loading';
import useUsersAtom from '../../context/contextUser';

const fullScreenHeight = Dimensions.get('window').height;

const Contact = ({navigation}: any) => {
  const [currentUser] = useUsersAtom();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contactList, setContactList] = useState<User[]>([]);
  const [filteredContacts, onFilterContact] = useState<User[]>([]);

  const {data: users} = useQuery<User[]>('users', async () => {
    if (currentUser.user_type === 'SUPPORT') {
      return await transport.get('/users/chef').then(res => res.data);
    } else if (
      currentUser.role === ROLE.SUPERADMIN ||
      currentUser.role === ROLE.ADMIN
    ) {
      return await transport.get('/users/all').then(res => res.data);
    } else {
      return await transport.get('/users/support').then(res => res.data);
    }
  });
  useEffect(() => {
    if (users != null) {
      setContactList(users);
      onFilterContact(users);
    }
  }, [users]);
  return (
    <>
      <ScrollView style={styles.container}>
        {filteredContacts.length === 0 ? (
          <Loading />
        ) : (
          filteredContacts
            .filter(
              contact =>
                contact.id !== currentUser?.id && contact.entity !== null,
            )
            .map((user, index) => (
              <ContactItem
                key={index}
                user={user}
                selectedSectionId={0}
                navigation={navigation}
              />
            ))
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7ff',
    height: fullScreenHeight,
  },
});
export default Contact;
