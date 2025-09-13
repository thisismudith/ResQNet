import React from 'react';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigator({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <AppStack /> : <AuthStack />;
}
