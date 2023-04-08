import React, {Dispatch, SetStateAction} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Modal, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {Button} from 'react-native-paper';
import {useMutation} from 'react-query';
import useUsersAtom from '../../../context/contextUser';
import {User} from '../../../types';
import transport from '../../../utils/Api';
import {COLORS} from '../../../utils/theme';

const CreateTopic: React.FC<{
  isVisible: boolean;
  recepient: User;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  navigation: any;
}> = ({isVisible, setIsVisible, recepient, navigation}) => {
  const [currentUser] = useUsersAtom();

  const {
    control,
    resetField,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      subject: '',
    },
  });

  const createTopicMutation = useMutation(
    async (data: {from: number; to: number; subject: string}) => {
      await transport
        .post('/mobile/conversations/topics/create', {topic: data})
        .then(res => res.data);
    },
    {
      onSuccess: async () => {
        console.log('Topic created');
        setIsVisible(false);
        resetField('subject');
        navigation.navigate('OpenScreen');
      },
      onError: async () => {
        console.log('Error Creating');
      },
    },
  );
  const CreateTopicHandler = (values: any) => {
    createTopicMutation.mutate({
      ...values,
      to: recepient.id,
      from: currentUser?.id,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      onTouchCancel={() => setIsVisible(false)}
      visible={isVisible}
      onPointerEnter={CreateTopicHandler}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalText}>{'Create new Topic with '}</Text>
            <Text style={styles.textStyle}> {recepient.name}</Text>
          </View>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, value}}) => (
              <TextInput
                placeholder="Add Topic"
                onChangeText={onChange}
                placeholderTextColor={COLORS.grey}
                style={styles.TextInput}
                value={value}
                clearButtonMode={'always'}
              />
            )}
            name="subject"
          />
          {errors.subject && <Text style={styles.error}>required.</Text>}
          <View style={styles.buttons}>
            <Button
              onPress={handleSubmit(CreateTopicHandler)}
              color="green"
              mode="contained"
              style={styles.buttonOpen}>
              create
            </Button>
            <Button
              style={styles.buttonClose}
              color="red"
              mode="outlined"
              onPress={() => setIsVisible(!isVisible)}>
              Cancel
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    display: 'flex',
    marginBottom: 12,
    flexDirection: 'row',
  },
  TextInput: {
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,.8)',
    borderBottomWidth: 0.5,
    color: COLORS.black,
    width: 200,
    marginBottom: 12,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  buttonOpen: {
    // backgroundColor: '#F194FF',
  },
  buttonClose: {
    marginLeft: 12,
    // backgroundColor: '#2196F3',
  },
  textStyle: {
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
    textAlign: 'center',
    color: COLORS.black,
  },
  error: {
    color: 'red',
    paddingLeft: 15,
    paddingRight: 15,
  },
});
export default CreateTopic;
