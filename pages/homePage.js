import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StatusContext } from './mycontext';

export default function HomePage({navigation}) {
    const statusContext = React.useContext(StatusContext);
    return (
        <View style={styles.container}>
            <Text>Home Page</Text>
            <Button title="Login" onPress={() => navigation.navigate("LoginPage")} />
            { statusContext.currentUser != null &&
                <Button title="Map" onPress={() => navigation.navigate("Map")} />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})