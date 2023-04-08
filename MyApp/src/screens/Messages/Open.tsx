import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useInfiniteQuery} from 'react-query';
import Loading from '../../Components/Loading';
import {ChatState, ROLE, Topic, TopicStatus} from '../../types';
import transport from '../../utils/Api';
import {SHADOWIOS} from '../../utils/theme';
import TopicItem from './Components/TopicItem';
import dayjs from 'dayjs';
import useUsersAtom from '../../context/contextUser';
import IconRefrech from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';

let page = 1;
const pageSize = 20;

const OpenScreen = ({navigation}: any) => {
  const [topicsList, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentUser] = useUsersAtom();
  const [state, setState] = useState<ChatState>({
    loader: false,
    userNotFound: 'No user found',
    drawerState: false,
    selectedSectionId: selectedTopic?.id != null ? selectedTopic.id : 0,
    selectedTabIndex: 1,
    selectedTopic: null,
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [topics, setTopicsPager] = useState<Topic[]>([]);
  const [valueId, setValueId] = useState('');
  const [valueDate, setValueDate] = useState<Date | undefined>(new Date(0));
  const [refreshing, setRefreshing] = useState(false);

  const date = dayjs(valueDate).format('YYYY-MM-DD');
  const {refetch, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery<any, unknown, {topics: Topic[]; totalTopic: number}>(
      ['topics', valueDate, valueId],
      async ({pageParam = page}) => {
        if (
          currentUser.role === ROLE.ADMIN ||
          currentUser.role === ROLE.SUPERADMIN
        ) {
          return await transport
            .get(
              `/mobile/conversations/topics?pageCurrent=${pageParam}&pageSize=${pageSize}&valueDate=${date}&valueId=${valueId}`,
            )
            .then(res => res.data);
        }
        return await transport
          .get(
            `/mobile/conversations/topics/${
              currentUser?.id ?? 0
            }?pageCurrent=${pageParam}&pageSize=${pageSize}&valueDate=${date}&valueId=${valueId}`,
          )
          .then(res => res.data);
      },
      {
        getNextPageParam: lastPage => {
          if (topics?.length < lastPage.totalTopic) {
            return page;
          }
          return undefined;
        },
        onSuccess: data => {
          if (data == null) {
            setTopicsPager([]);
          } else {
            setTopicsPager(data.pages.flatMap(p => p.topics));
          }
        },
        onError: err => {
          console.log(err);
        },
      },
    );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    if (selectedTopic != null) {
      setState({
        ...state,
        selectedSectionId: selectedTopic?.id,
      });
    }
    if (topics != null) {
      setTopics(topics);
    }
    return unsubscribe;
  }, [selectedTopic, state, topics, navigation, refetch]);

  const filteredOpenTopics = useMemo(
    () =>
      topicsList
        .filter(topic => topic?.status === TopicStatus.OPEN)
        .sort((a, b) => b.unreadMessages - a.unreadMessages),
    [topicsList],
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

    refetch().then(() => setRefreshing(false));
    setValueId('');
    setValueDate(new Date(0));
  }, [refetch]);

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
          style={styles.input}
          placeholder="search"
          value={valueId}
          keyboardType="numeric"
          placeholderTextColor={'grey'}
          onChangeText={id => setValueId(id)}
          clearButtonMode="while-editing"
        />
        <View style={styles.showView}>
          <TextInput
            value={`${date}`}
            style={styles.textInput}
            accessible={false}
            editable={false}
          />
          <Button
            onPress={showDatePicker}
            style={styles.showBtn}
            color="green"
            mode="contained">
            Select
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
      {isLoading || refreshing === true ? (
        <>
          <Loading />
        </>
      ) : filteredOpenTopics.length > 0 ? (
        <FlashList
          data={filteredOpenTopics}
          estimatedItemSize={200}
          renderItem={({item}) => (
            <TopicItem
              topic={item}
              selectedSectionId={state.selectedSectionId}
              onSelectTopic={setSelectedTopic}
              navigation={navigation}
            />
          )}
          ListFooterComponent={renderFooter()}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.Message}>
          <Text style={styles.textNOData}>No Data Found</Text>
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
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOWIOS,
    height: Platform.OS === 'ios' ? 40 : 40,
    color: 'black',
    width: '25%',
    marginTop: '3%',
    borderRadius: 10,
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
  headerAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginHorizontal: '1%',
  },
  showBtn: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2%',
    marginTop: '2%',
    marginLeft: '4%',
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
export default OpenScreen;
