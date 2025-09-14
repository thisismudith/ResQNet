import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth, { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { idFromPhone, getCurrentPhone } from '../lib/phone';

type Role = 'receiver' | 'rescuer' | 'unknown';

export default function UserScreen() {
  const nav = useNavigation<any>();

  const [phone, setPhone] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('unknown');
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current user details
  useEffect(() => {
    const p = getCurrentPhone();
    if (!p) {
      // Not signed in; bounce to Login
      nav.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    setPhone(p);

    const phoneId = idFromPhone(p);
    const db = firestore();

    const receiversRef = db.doc(`receivers/${phoneId}`);
    const rescuersRef  = db.doc(`rescuers/${phoneId}`);

    (async () => {
      try {
        const [recvSnap, rescSnap] = await Promise.all([
          receiversRef.get(),
          rescuersRef.get(),
        ]);

        // Prefer rescuer if both exist
        if (rescSnap.exists()) {
          setRole('rescuer');
          const data = rescSnap.data() || {};
          const n = (data.name as string) || '';
          setName(n);
          setInitialName(n);
        } else if (recvSnap.exists()) {
          setRole('receiver');
          const data = recvSnap.data() || {};
          const n = (data.name as string) || '';
          setName(n);
          setInitialName(n);
        } else {
          // Not registered yet — send to setup
          nav.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
          return;
        }
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const onSave = async () => {
    if (!phone) return;
    if (name.trim() === initialName.trim()) return; // nothing to save

    try {
      setSaving(true);
      const phoneId = idFromPhone(phone);
      const db = firestore();
      const col = role === 'rescuer' ? 'rescuers' : 'receivers';
      await db.doc(`${col}/${phoneId}`).set(
        {
          name: name.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      setInitialName(name.trim());
      Alert.alert('Saved', 'Your name has been updated.');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    try {
      await auth().signOut();
      nav.reset({ index: 0, routes: [{ name: 'Login' }] }); // adjust route name if needed
    } catch (e: any) {
      Alert.alert('Sign out failed', e?.message ?? String(e));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>My Account</Text>
      
      <Text style={styles.label}>Full name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your full name"
        style={styles.input}
      />

      <Text style={styles.label}>Registered number</Text>
      <View style={styles.readonlyBox}>
        <Text style={styles.readonlyText}>{phone ?? '-'}</Text>
      </View>

      <Text style={styles.label}>User type</Text>
      <View style={styles.readonlyBox}>
        <Text style={styles.readonlyText}>
          {role === 'rescuer' ? 'Rescuer' : role === 'receiver' ? 'Receiver' : 'Unknown'}
        </Text>
      </View>

      <Pressable
        onPress={onSave}
        disabled={saving || name.trim() === initialName.trim()}
        style={[
          styles.btn,
          (saving || name.trim() === initialName.trim()) && styles.btnDisabled,
        ]}
      >
        <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
      </Pressable>

      <Pressable onPress={onSignOut} style={styles.signOutBtn}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, padding: 16, paddingTop: 24, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 16 },

  label: { fontWeight: '800', color: '#374151', marginTop: 10, marginBottom: 6 },

  readonlyBox: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ecedefff',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  readonlyText: { color: '#111827', fontWeight: '800' },

  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F6F7F9',
    paddingHorizontal: 14,
    color: '#111827',
    fontWeight: '800',
  },

  btn: {
    marginTop: 18,
    backgroundColor: '#111827',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '800' },

  signOutBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  signOutText: { color: '#EF4444', fontWeight: '900' },
});
