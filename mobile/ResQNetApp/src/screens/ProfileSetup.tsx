// src/screens/ProfileSetup.tsx
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { getCurrentPhone, idFromPhone } from '../lib/phone';

const SECURITY_CODE = '171007';

export default function ProfileSetup() {
  const nav = useNavigation<any>();
  const db = getFirestore();

  const phone = getCurrentPhone() ?? '';
  const [fullName, setFullName] = useState('');
  const [isRescuer, setIsRescuer] = useState(false);
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      if (!phone) {
        Alert.alert('Error', 'No phone number on the user.');
        return;
      }
      const key = idFromPhone(phone);

      // If rescuer path
      if (isRescuer) {
        if (code.trim() !== SECURITY_CODE) {
          Alert.alert('Invalid code', 'Security code is incorrect.');
          return;
        }

        const rescRef = doc(db, 'rescuers', key);
        const rescSnap = await getDoc(rescRef);
        if (rescSnap.exists()) {
          // Already registered as rescuer -> go in
          nav.reset({ index: 0, routes: [{ name: 'SOS' }] });
          return;
        }

        setSaving(true);
        await setDoc(
          rescRef,
          {
            phone,
            name: fullName.trim() || null,
            role: 'rescuer',
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        nav.reset({ index: 0, routes: [{ name: 'SOS' }] });
        return;
      }

      // Receiver path
      if (!fullName.trim()) {
        Alert.alert('Full name required', 'Please enter your full name.');
        return;
      }

      const recvRef = doc(db, 'receivers', key);
      const recvSnap = await getDoc(recvRef);
      if (recvSnap.exists()) {
        // Already registered as receiver -> go in
        nav.reset({ index: 0, routes: [{ name: 'SOS' }] });
        return;
      }

      setSaving(true);
      await setDoc(
        recvRef,
        {
          phone,
          name: fullName.trim(),
          role: 'receiver',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      nav.reset({ index: 0, routes: [{ name: 'SOS' }] });
    } catch (e: any) {
      Alert.alert('Failed to save', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Set up your profile</Text>
      <Text style={styles.meta}>Phone: {phone || 'unknown'}</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        style={styles.input}
      />

      {/* Rescuer toggle */}
      <Pressable style={styles.checkRow} onPress={() => setIsRescuer(x => !x)}>
        <View style={[styles.checkbox, isRescuer && styles.checkboxOn]} />
        <Text style={styles.checkLabel}>Are you a Rescuer?</Text>
      </Pressable>

      {isRescuer && (
        <>
          <Text style={styles.label}>Security code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter security code"
            style={styles.input}
            secureTextEntry
          />
          <Text style={styles.hint}>Only authorized rescuers should enable this.</Text>
        </>
      )}

      <Pressable onPress={save} style={styles.btn} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save & Continue'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 28, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '900', color: '#111827' },
  meta: { color: '#6b7280', marginTop: 4, marginBottom: 12 },
  label: { fontWeight: '800', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, height: 44,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#111827', backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: '#111827' },
  checkLabel: { fontWeight: '800', color: '#111827' },
  hint: { color: '#6b7280', marginTop: 6 },
  btn: {
    marginTop: 18, backgroundColor: '#111827', borderRadius: 10,
    height: 46, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
});