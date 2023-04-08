import {ParamListBase} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {useState} from 'react';
import {
  TextInput,
  Platform,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-paper';
import {useInfiniteQuery, useQueryClient} from 'react-query';
import {Accordion} from '../../Components/Accordion';
import Loading from '../../Components/Loading';
import {ROLE, Ticket, TICKET_STATUS} from '../../types';
import transport from '../../utils/Api';
import {COLORS, SHADOWIOS} from '../../utils/theme';
import dayjs from 'dayjs';
import useUsersAtom from '../../context/contextUser';
import IconRefrech from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';

let page = 1;
const pageSize = 20;

const ClosedTickets = ({navigation}: StackScreenProps<ParamListBase>) => {
  const [currentUser] = useUsersAtom();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useColorScheme();
  const [filtredData, setFiltredData] = useState<Ticket[]>([]);
  const [valueId, setValueId] = useState('');
  const [valueDate, setValueDate] = useState<Date | undefined>(new Date(0));
  const queryClient = useQueryClient();

  let queryParams = {};
  let filter = {};

  if (currentUser.user_type === 'PROD') {
    if (currentUser.role === 'TEAMMEMBER') {
      filter = {
        user: {
          id: currentUser.id,
        },
      };
    } else if (currentUser.role === 'TEAMLEADER') {
      filter = {
        issuer_team: {
          id: currentUser.team.id,
        },
        entity: {
          id: currentUser.entity.id,
        },
      };
    } else if (currentUser.role === 'CHEF') {
      filter = {
        entity: {
          id: currentUser.entity.id,
        },
      };
    }
    queryParams = {
      access_entity: currentUser?.access_entity ?? [],
      access_team: currentUser?.access_team ?? [],
      status: TICKET_STATUS.Closed,
      filter,
      read: currentUser?.id ?? 0,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    };
  } else if (currentUser.user_type === 'SUPPORT') {
    if (currentUser.role === 'TEAMMEMBER') {
      filter = {
        target_team: {
          id: currentUser.team?.id,
        },
        user: {
          id: currentUser.id,
        },
      };
    } else if (currentUser.role === 'TEAMLEADER') {
      filter = {
        target_team: ['id', currentUser.access_team],
        issuer_team: {
          id: currentUser.team?.id,
        },
        user: {
          id: currentUser?.id,
        },
      };
    } else if (currentUser.role === 'CHEF') {
      filter = {
        departement: [
          'id',
          currentUser.departements.map((depart: any) => depart.id),
        ],
        user: {
          id: currentUser.id,
        },
      };
    }
    queryParams = {
      read: currentUser?.id ?? 0,
      access_entity: currentUser?.access_entity ?? [],
      status: TICKET_STATUS.Closed,
      filter,
      sortField: 'updatedAt',
      sortOrder: 'desc',
      access_team: currentUser?.access_team ?? [],
      assigned_to: ['TEAMLEADER', 'CHEF'].includes(currentUser.role)
        ? null
        : currentUser.id,
    };
  } else if (
    currentUser.role === ROLE.ADMIN ||
    currentUser.role === ROLE.SUPERADMIN
  ) {
    queryParams = {
      access_entity: [],
      access_team: [],
      filter: {},
      status: TICKET_STATUS.Closed,
      pageNumber: 1,
      pageSize: 10,
      read: currentUser?.id ?? 0,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    };
  }
  const date = dayjs(valueDate).format('YYYY-MM-DD');

  // get tickets
  const {refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery<any, unknown, {entities: Ticket[]; totalCount: number}>(
      ['tickets_mobile_closed', valueId, valueDate],
      async ({pageParam = page}) => {
        if (
          currentUser != null &&
          (currentUser.role === ROLE.ADMIN ||
            currentUser.role === ROLE.SUPERADMIN)
        ) {
          return await transport
            .post(
              `/mobile/tickets/find?pageCurrent=${pageParam}&pageSize=${pageSize}&valueId=${valueId}&valueDate=${date}`,
              {
                queryParams,
              },
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              },
            )
            .then(res => res.data);
        } else if (currentUser != null && currentUser.user_type === 'PROD') {
          return await transport
            .post(
              `/mobile/tickets/global/find?pageCurrent=${pageParam}&pageSize=${pageSize}&valueId=${valueId}&valueDate=${date}`,
              {queryParams},
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              },
            )
            .then(res => res.data);
        } else if (currentUser != null && currentUser.user_type === 'SUPPORT') {
          return await transport
            .post(
              `/mobile/tickets/tech/find?pageCurrent=${pageParam}&pageSize=${pageSize}&valueId=${valueId}&valueDate=${date}`,
              {
                queryParams,
              },
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            )
            .then(res => res.data);
        }
      },
      {
        getNextPageParam: lastPage => {
          if (filtredData?.length < lastPage.totalCount) {
            return page;
          }
          return undefined;
        },

        onSuccess: data => {
          if (data == null) {
            setFiltredData([]);
          } else {
            setFiltredData(data.pages.flatMap(p => p.entities));
          }
        },
        onError: err => {
          console.log(err);
        },
      },
    );

  // Load more data
  const handleMoreData = () => {
    page++;
    fetchNextPage();
  };

  // search by date
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  //  to hundle Refresh Control in list
  const onRefresh = React.useCallback(() => {
    page = 1;
    setRefreshing(true);

    refetch()
      .then(() => queryClient.refetchQueries('ticketCount'))
      .then(() => setRefreshing(false));
    setValueId('');
    setValueDate(new Date(0));
  }, [queryClient, refetch]);

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View>
        {
          // remove btn fetch when seraching
          valueId.length === 0 ? (
            <TouchableOpacity activeOpacity={0.9}>
              {isFetchingNextPage === true ? (
                <ActivityIndicator color="green" size={'large'} />
              ) : null}
              <Button
                onPress={handleMoreData}
                color={'#87CEEB'}
                style={styles.fetch}
                disabled={!hasNextPage || isFetchingNextPage}>
                {' '}
                fetch more
              </Button>
            </TouchableOpacity>
          ) : null
        }
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerAction}>
        <TextInput
          style={theme === 'light' ? styles.searchBar : styles.searchBarDark}
          placeholder="Search"
          keyboardType="numeric"
          value={valueId}
          placeholderTextColor={COLORS.grey}
          onChangeText={num => setValueId(num)}
          clearButtonMode="while-editing"
        />

        <View style={styles.showView}>
          <TextInput
            value={`${date}`}
            accessible={false}
            editable={false}
            style={styles.textInput}
          />
          <Button
            onPress={showDatePicker}
            style={styles.showBtn}
            color="green"
            mode="contained">
            {' '}
            Select{' '}
          </Button>
        </View>
        <DatePicker
          modal
          open={isDatePickerVisible}
          date={dayjs(undefined).toDate()}
          mode="date"
          onConfirm={value => {
            hideDatePicker();
            setValueDate(value);
          }}
          onCancel={() => {
            hideDatePicker();
          }}
        />
      </View>
      {isLoading === true || refreshing === true ? (
        <>
          <Loading />
        </>
      ) : filtredData?.length > 0 ? (
        <FlashList
          data={filtredData}
          estimatedItemSize={20}
          renderItem={({item}) => (
            <Accordion data={item} key={item.id} navigation={navigation} />
          )}
          ListFooterComponent={renderFooter()}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.Message}>
          <Text style={styles.textNOData}>No Tickets Found</Text>
        </View>
      )}
      <TouchableOpacity style={styles.floatBtn} onPress={onRefresh}>
        <IconRefrech name="refresh" size={30} color={'blue'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7ff',
    height: '100%',
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
    backgroundColor: COLORS.blue,
  },
  mainCardView: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8cc9ffba',
    borderRadius: 15,
    shadowColor: 'shadow',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'column',
  },
  headerView: {
    backgroundColor: COLORS.blue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 80,
  },
  headerAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginHorizontal: '1%',
  },
  button: {
    padding: 12,
  },
  picker: {
    marginTop: 2,
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    color: COLORS.blue,
    borderWidth: 0,
  },
  searchBar: {
    marginLeft: '4%',
    marginBottom: '2%',
    marginTop: '3%',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    height: Platform.OS === 'ios' ? 50 : 40,
    width: '30%',
    ...SHADOWIOS,
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 'larger',
    fontWeight: 'bold',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    borderWidth: 0,
  },
  searchBarDark: {
    marginLeft: '4%',
    marginBottom: '2%',
    marginTop: '3%',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
    height: Platform.OS === 'ios' ? 50 : 40,
    width: '30%',
    ...SHADOWIOS,
  },
  Message: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  textNOData: {
    color: '#c4c7cb',
    fontSize: 30,
  },
  showBtn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '2%',
    marginTop: '2%',
  },
  fetch: {marginLeft: '10%', marginRight: '10%', padding: 8},
  floatBtn: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    position: 'absolute',
    bottom: 10,
    left: 10,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  textInput: {
    color: 'black',
    backgroundColor: '#C0C0C0',
    borderRadius: 10,
    width: '40%',
    textAlign: 'center',
    padding: '2%',
    marginTop: '2%',
    height: '80%',
  },
  showView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: '2%',
    marginTop: '2%',
  },
});
export default ClosedTickets;
