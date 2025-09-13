// src/app/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import { useAuth } from '../providers/AuthProvider';

type RootParamList = { App: undefined; Auth: undefined };
const Root = createNativeStackNavigator<RootParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // keep it simple; replace with your own splash
    return null;
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Root.Screen name="App" component={AppStack} />
      ) : (
        <Root.Screen name="Auth" component={AuthStack} />
      )}
    </Root.Navigator>
  );
}