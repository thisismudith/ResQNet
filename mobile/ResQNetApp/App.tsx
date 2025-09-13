import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function App() {
  const [phone, setPhone] = useState('+91'); // enter full E.164, e.g., +919876543210
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Listen to auth state
  useEffect(() => {
    return auth().onAuthStateChanged(setUser);
  }, []);

  const sendCode = async () => {
    const p = phone.trim();
    if (!/^\+\d{7,15}$/.test(p)) {
      Alert.alert('Invalid phone', 'Enter number in E.164 format, e.g., +919876543210');
      return;
    }
    setLoading(true);
    try {
      const c = await auth().signInWithPhoneNumber(p); // triggers SMS / reCAPTCHA
      setConfirm(c);
    } catch (e: any) {
      Alert.alert('Error sending code', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirm) return;
    const c = code.trim();
    if (c.length < 4) {
      Alert.alert('Invalid code', 'Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await confirm.confirm(c); // success => onAuthStateChanged fires
      setCode('');
    } catch {
      Alert.alert('Verification failed', 'The code is incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await auth().signOut();
    setConfirm(null);
    setPhone('+91');
    setCode('');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Please wait…</Text>
      </SafeAreaView>
    );
  }

  // Logged-in view
  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Signed in</Text>
        <Text style={{ marginBottom: 16 }}>{user.phoneNumber}</Text>
        <TouchableOpacity style={styles.button} onPress={signOut}>
          <Text style={styles.btnText}>Sign out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Login flow
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Phone login</Text>

      {!confirm ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="e.g., +919876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.button} onPress={sendCode}>
            <Text style={styles.btnText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 6 }}>Code sent to {phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={verifyCode}>
            <Text style={styles.btnText}>Verify & Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#6b7280' }]} onPress={() => setConfirm(null)}>
            <Text style={styles.btnText}>Change number</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#111827', paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
