// src/screens/PostAuthGate.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { getCurrentPhone, idFromPhone } from '../lib/phone';
import { useNavigation } from '@react-navigation/native';

export default function PostAuthGate() {
  const nav = useNavigation<any>();

  useEffect(() => {
    const run = async () => {
      const phone = getCurrentPhone();
      const key = idFromPhone(phone);

      // If no phone on user (shouldn’t happen after OTP), bounce to setup as a safeguard
      if (!key) {
        nav.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
        return;
      }
      nav.reset({ index: 0, routes: [{ name: 'SOS' }] });
    };

    run();
  }, [nav]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}