// src/app/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SOS from '../../screens/SOS';
import PostAuthGate from '../../screens/PostAuthGate';
import ProfileSetup from '../../screens/ProfileSetup';
import TopTabsNavigator from './TopTabsNavigator'; // if you use top tabs for Home/Alerts/etc.

export type AppStackParamList = {
  PostAuthGate: undefined;
  ProfileSetup: undefined;
  SOS: undefined;
  TopTabs: undefined; // optional, if you route to tabs
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="PostAuthGate" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PostAuthGate" component={PostAuthGate} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
      <Stack.Screen name="SOS" component={SOS} />
      <Stack.Screen name="TopTabs" component={TopTabsNavigator} />
    </Stack.Navigator>
  );
}