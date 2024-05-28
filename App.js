import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen  from './screens/LoginScreen';
import SignUpScreen  from './screens/SignUpScreen';
import HomeScreen  from './screens/HomeScreen';
import POSScreen  from './screens/POSScreen';
import OrderQueueScreen  from './screens/OrderQueueScreen';
import MenuEditorScreen  from './screens/MenuEditorScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function HomeStack(){
  return(
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ), }}
        />
      <Tab.Screen 
        name="POS" 
        component={POSScreen} 
        options={{ headerShown: false,
          tabBarLabel: 'POS',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="note-plus" color={color} size={size} />
          ), }}/>
      <Tab.Screen 
        name="Menu" 
        component={MenuEditorScreen} 
        options={{ headerShown: false,
          tabBarLabel: 'Menu Editor',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food" color={color} size={size} />
          ), }}/>
      <Tab.Screen 
        name="Queue" 
        component={OrderQueueScreen} 
        options={{ headerShown: false,
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food" color={color} size={size} />
          ), }}/>
    </Tab.Navigator>
  )
}

async function changeScreenOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
}

function App() {

  //Async Functions will load in Use Effect
  useEffect(() => {
    changeScreenOrientation() 
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false
        }}
        initialRouteName = "Login"
      >
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="SignUp" component={SignUpScreen}/>
        <Stack.Screen
          name="HomeStack"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;