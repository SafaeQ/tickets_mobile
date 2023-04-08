import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Dimensions,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {Button} from 'react-native-paper';
import transport from '../utils/Api';
import {Departement, Entity, ROLE, Team, Ticket} from '../types';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import Toast from 'react-native-simple-toast';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import useUsersAtom from '../context/contextUser';
import {socket} from '../context/socket.provider';

const fullScreenHeight = Dimensions.get('window').height;
const fullScreenWidth = Dimensions.get('window').width;

const CreateTickets = ({navigation}: any) => {
  const queryClient = useQueryClient();
  const [currentUser] = useUsersAtom();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      subject: '',
      related_ressource: '',
      departement: '',
      body: '',
      severity: '',
      team: '',
      entity: '',
    },
  });

  const severity = ['MINOR', 'CRITICAL', 'MAJOR'];

  //   const [filteredTeam, setTeams] = useState<Team[]>([]);
  const {data: teams, isFetched: isFetchedTeams} = useQuery<Team[]>(
    'teams',
    async () => await transport.get('/teams').then(res => res.data),
  );

  const {data: entities, isFetched: isFetchedentities} = useQuery<Entity[]>(
    'entities',
    async () => await transport.get('/entities').then(res => res.data),
  );

  const {data: departements, isFetched: isFetchedDepart} = useQuery<
    Departement[]
  >(
    'departements',
    async () => await transport.get('/departements').then(res => res.data),
  );

  const createMutation = useMutation(
    async (ticket: Ticket) => {
      return transport.post('/tickets/create', {ticket}).then(res => res.data);
    },
    {
      onSuccess: async (data: {ticket: Ticket}) => {
        queryClient.refetchQueries('tickets');
        Toast.show('Ticket created');
        socket.emit('createTicket', data.ticket.id);
        navigation.navigate('Tickets');
        // await refetch();
      },
      onError: async (err: any) => {
        console.log(err.response.data);
        Toast.show('Error Creating');
      },
    },
  );

  const PostTicketHandler = (values: any) => {
    try {
      if (currentUser != null) {
        createMutation.mutate({
          ...values,
          departement: values.departement.id,
          severity: values.severity ? values.severity : 'MINOR',
          target_team: values.team.id,
          user: currentUser.id,
          entity: values.entity?.id ?? currentUser.entity.id,
          issuer_team: currentUser.team?.id ?? undefined,
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const [depSelect, setdepSelect] = useState<Departement>();

  let filteringDepartement = departements?.find(
    depart => depart.id === depSelect?.id,
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.inputView}>
          <Text style={styles.text}>Subject</Text>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, value}}) => (
              <TextInput
                placeholder="Subject"
                placeholderTextColor={'grey'}
                onChangeText={onChange}
                value={value}
                clearButtonMode={'always'}
                style={styles.input}
              />
            )}
            name="subject"
          />
          {errors.subject && (
            <Text style={styles.error}>subject is required.</Text>
          )}
        </View>
        <View style={styles.inputView}>
          <Text style={styles.text}>Related Ressource</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, value}}) => (
              <TextInput
                placeholderTextColor={'grey'}
                placeholder="Related Ressource"
                onChangeText={onChange}
                style={styles.input}
                value={value}
                clearButtonMode={'always'}
              />
            )}
            name="related_ressource"
          />
          {errors.related_ressource && (
            <Text style={styles.error}>Related Ressource is required.</Text>
          )}
        </View>
        <View style={styles.inputView}>
          <Text style={styles.text}>Departement</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange}}) => (
              <SelectDropdown
                data={
                  isFetchedDepart && departements != null
                    ? departements.filter(
                        depart => depart.depart_type === 'SUPPORT',
                      )
                    : []
                }
                buttonTextAfterSelection={selectedItem => {
                  return selectedItem.name;
                }}
                renderDropdownIcon={isOpened => {
                  return (
                    <Icon
                      name={isOpened ? 'chevron-up' : 'chevron-down'}
                      color={'black'}
                      size={18}
                    />
                  );
                }}
                onSelect={value => {
                  onChange(value);
                  setdepSelect(value);
                }}
                rowTextForSelection={item => {
                  return item.name;
                }}
                buttonStyle={styles.select}
              />
            )}
            name="departement"
          />
          {errors.departement && (
            <Text style={styles.error}>departement is required.</Text>
          )}
        </View>
        <View style={styles.inputView}>
          <Text style={styles.text}>Team</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange}}) => (
              <SelectDropdown
                data={
                  isFetchedTeams && teams != null
                    ? teams.filter(
                        team =>
                          team?.departement.id === filteringDepartement?.id,
                      )
                    : []
                }
                buttonTextAfterSelection={selectedItem => {
                  return selectedItem.name;
                }}
                renderDropdownIcon={isOpened => {
                  return (
                    <Icon
                      name={isOpened ? 'chevron-up' : 'chevron-down'}
                      color={'black'}
                      size={18}
                    />
                  );
                }}
                onSelect={onChange}
                rowTextForSelection={item => {
                  return item.name;
                }}
                buttonStyle={styles.select}
              />
            )}
            name="team"
          />
          {errors.team && <Text style={styles.error}>team is required.</Text>}
        </View>
        {currentUser.role === ROLE.ADMIN ||
        currentUser.role === ROLE.SUPERADMIN ? (
          <View style={styles.inputView}>
            <Text style={styles.text}>Entity</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({field: {onChange}}) => (
                <SelectDropdown
                  data={
                    isFetchedentities && entities != null
                      ? entities.filter(entity => entity.id)
                      : []
                  }
                  buttonTextAfterSelection={selectedItem => {
                    return selectedItem.name;
                  }}
                  renderDropdownIcon={isOpened => {
                    return (
                      <Icon
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        color={'black'}
                        size={18}
                      />
                    );
                  }}
                  onSelect={onChange}
                  rowTextForSelection={item => {
                    return item.name;
                  }}
                  buttonStyle={styles.select}
                />
              )}
              name="entity"
            />
          </View>
        ) : null}
        <View style={styles.inputView}>
          <Text style={styles.text}>Message</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({field: {onChange, value}}) => (
              <TextInput
                clearTextOnFocus
                placeholder="Message"
                placeholderTextColor={'grey'}
                style={styles.input}
                onChangeText={onChange}
                value={value}
                clearButtonMode={'always'}
                multiline
              />
            )}
            name="body"
          />
          {errors.body && (
            <Text style={styles.error}>Message is required.</Text>
          )}
        </View>
        <View style={styles.inputView}>
          <Text style={styles.text}>Severity</Text>
          <Controller
            control={control}
            render={({field: {onChange}}) => (
              <SelectDropdown
                data={severity}
                buttonStyle={styles.select}
                defaultValue="MINOR"
                defaultValueByIndex={0}
                defaultButtonText="MINOR"
                buttonTextAfterSelection={selectedItem => {
                  return selectedItem;
                }}
                renderDropdownIcon={isOpened => {
                  return (
                    <Icon
                      name={isOpened ? 'chevron-up' : 'chevron-down'}
                      color={'black'}
                      size={18}
                    />
                  );
                }}
                onSelect={onChange}
                rowTextForSelection={item => {
                  return item;
                }}
              />
            )}
            name="severity"
          />
        </View>
        <View style={styles.buttons}>
          <Button
            color="green"
            mode="contained"
            onPress={handleSubmit(PostTicketHandler)}>
            Post
          </Button>
          <Button color="blue" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7ff',
    // margin: 6,
    height: fullScreenHeight,
    paddingTop: 20,
  },
  select: {
    width: fullScreenWidth - 40,
    backgroundColor: '#FFFFFF',
    color: 'black',
  },
  inputView: {
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: 'black',
    // borderBottomWidth: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    tintColor: 'black',
    color: 'black',
    height: Platform.OS === 'ios' ? 50 : 50,
    // borderBottomColor: '#FFFFFF',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingTop: 12,
  },

  error: {
    color: 'red',
    paddingLeft: 15,
    paddingRight: 15,
  },
  text: {
    color: 'black',
    paddingBottom: 4,
  },
});
export default CreateTickets;
