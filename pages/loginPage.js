import { Button, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, 
  onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence, signInWithCredential } from 'firebase/auth';
import { app, database, auth } from '../firebase'
import { useEffect, useState, useContext } from 'react';
import { registerForPushNotificationsAsync, scheduleNotificationAsync, 
  getPermissionsAsync, requestPermissionsAsync, presentNotificationAsync } from 'expo-notifications';
//import { getAsync, askAsync, NOTIFICATIONS } from 'expo-permissions';
import { StatusContext } from './mycontext'

export default function LoginPage({navigation}) {
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [enteredText, setEnteredText] = useState("")
  const statusContext = useContext(StatusContext)


  useEffect(() => {
    requestPushNotificationPermission()
    const auth_ = getAuth()
    const unsubscribe = onAuthStateChanged(auth_, (currentUser) => {
      if (currentUser) {
        console.log("Listener: Logged in as:", currentUser.uid)
        setUserId(currentUser.uid)
        statusContext.setCurrentUser(currentUser)
      } else {
        console.log("Listener: Not logged in")
        statusContext.setCurrentUser(null)
      }
    })
    return () => unsubscribe() // when component unmounts, unsubscribe from listener
  }, []) // empty array means that this effect will only run once, after the first render

  async function requestPushNotificationPermission() {
    const { status: existingStatus } = await getPermissionsAsync();
    
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission not granted for notifications');
        return;
      }
    }
    console.log('Permission granted for notifications');
  }  
  
  async function sendNotification(title, body) {
    const { status } = await getPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission not granted for notifications');
      return;
    }
  
    await presentNotificationAsync({
      title: title,
      body: body,
    });
  }
  
  async function signup(){
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Signed up as: " + userCredential.user.uid)
    } catch (error){
      console.log("Failed to sign up: " + error)
    }
  }
  
  async function login(){
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Logged in as:", userCredential.user.uid)

      sendNotification("Login", "You have logged in")
    } catch (error){
      console.log("Failed to login:", error)
    }
  }
  
  async function signout(){
    await signOut(auth)
    setUserId("")

    sendNotification("Sign out", "You have signed out")
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Page</Text>
      { userId ? 
        <Text>Logged in as: {userId}</Text> :
        <Text>Not logged in</Text>
      }
      { !userId &&
        <View style={styles.createUserContainer}>
          <Text style={{fontSize: 20}}>Create User</Text>
          <TextInput 
          style={styles.TextInput}
          placeholder='Email'
          onChangeText={newText => { setEmail(newText) }}
          />
          <TextInput
          style={styles.TextInput}
          placeholder='Password'
          onChangeText={newText => { setPassword(newText) }}
          />
          <Button style={styles.button} title="Create" onPress={signup} />
        </View>
      }

      <Text style={{fontSize: 20}}>Login</Text>
      <TextInput
      style={styles.TextInput}
      placeholder='Email'
      onChangeText={newText => { setEmail(newText) }}
      />
      <TextInput 
      style={styles.TextInput}
      placeholder='Password'
      onChangeText={newText => { setPassword(newText) }}
      />
      <View style={styles.buttonContainer}>      
        <Button style={styles.button} title="Login" onPress={login} />
        <Button style={styles.button} title="Sign out" onPress={signout} />
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
  TextInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    margin: 10,
    textAlign: 'center',
    color: 'black',
    fontSize: 20,
    width: '95%',
  },
  text: {
    color: 'black',
    fontSize: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    fontSize: 30,
  },
  addNotesContainer: {
    width: '95%',
    alignItems: 'center',
  },
  createUserContainer: {
    width: '95%',
    alignItems: 'center',
    marginBottom: 20,
  }
});

// npx expo install @react-native-async-storage/async-storage