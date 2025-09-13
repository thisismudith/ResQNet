import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, Alert, ActivityIndicator, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../app/navigation/types.ts';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Button from '../ui/Button';
import TextField from '../ui/TextField';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen(_props: Props) {
  const [phone, setPhone] = useState('+91');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // (Optional) if already logged in, this screen will unmount because RootNavigator swaps stacks.

  const sendCode = async () => {
    const p = phone.trim();
    if (!/^\+\d{7,15}$/.test(p)) {
      Alert.alert('Invalid phone', 'Use E.164 format, e.g., +919876543210');
      return;
    }
    setLoading(true);
    try {
      const c = await auth().signInWithPhoneNumber(p);
      setConfirm(c);
    } catch (e: any) {
      Alert.alert('Error sending code', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirm) return;
    if (code.trim().length < 4) {
      Alert.alert('Invalid code', 'Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await confirm.confirm(code.trim()); // success => auth state changes; RootNavigator switches to App stack
    } catch {
      Alert.alert('Verification failed', 'The code is incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Please wait…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Phone login</Text>

      {!confirm ? (
        <View style={styles.block}>
          <TextField
            placeholder="e.g., +919876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button title="Send OTP" onPress={sendCode} />
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={{ marginBottom: 6 }}>Code sent to {phone}</Text>
          <TextField
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
          <Button title="Verify & Sign in" onPress={verifyCode} />
          <Button title="Change number" variant="secondary" onPress={() => setConfirm(null)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  block: { gap: 12 },
});
