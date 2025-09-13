import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import TopTabsNavigator from './TopTabsNavigator';
import SOSScreen from '../../screens/SOS';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="SOS" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TopTabs" component={TopTabsNavigator} />
      <Stack.Screen name="SOS" component={SOSScreen} />
    </Stack.Navigator>
  );
}