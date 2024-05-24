import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StatusContextProvider from './pages/mycontext';
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import Map from './pages/map';
import MarkerPictures from './pages/markerPictures';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <StatusContextProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='HomePage'>
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="MarkerPictures" component={MarkerPictures} />
        </Stack.Navigator>
      </NavigationContainer>
    </StatusContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
