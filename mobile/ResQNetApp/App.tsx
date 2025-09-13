import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';   // ⬅️ add

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(undefined);

  useEffect(() => {
    return auth().onAuthStateChanged(u => setUser(u ?? null));
  }, []);

  if (user === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>                              {/* ⬅️ wrap once at the root */}
      <NavigationContainer>
        <RootNavigator isLoggedIn={!!user} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}