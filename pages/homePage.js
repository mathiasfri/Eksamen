import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StatusContext } from './mycontext';

export default function HomePage({navigation}) {
    const statusContext = React.useContext(StatusContext);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to your personalized map!</Text>
            <View style={styles.buttonContainer}>
                <Button title="Login Page" onPress={() => navigation.navigate("LoginPage")} />
                { statusContext.currentUser != null &&
                    <Button title="Open Map" onPress={() => navigation.navigate("Map")} />
                }
            </View>
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
    text:{
        fontSize: 20,
        color: 'black',
        marginBottom: 50,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '95%',
        justifyContent: 'space-evenly',
        marginBottom: 10,
      },
})