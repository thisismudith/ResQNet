import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types.ts';
import LandingScreen from '../../screens/Landing.tsx';
import LoginScreen from '../../screens/Login.tsx';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Landing" component={LandingScreen} options={{ title: 'Welcome' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
    </Stack.Navigator>
  );
}
