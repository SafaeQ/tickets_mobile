import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';

// back to first solution is navigation.navigate(loqding)

const LoadingScreen = () => {
    return (
        // <View style={{ flex: 1, position: 'absolute', zIndex: 1010, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF2F4', opacity: 0.3 }}>
        //     <StatusBar backgroundColor="#2c3e50" barStyle="light-content" />
        //     <ActivityIndicator size="large" color="#00ff00" animating={true} />
        // </View>
        <Spinner visible={true} />

    )
}


export default LoadingScreen;
