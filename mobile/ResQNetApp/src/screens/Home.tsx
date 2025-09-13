import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import Button from '../ui/Button';
import auth from '@react-native-firebase/auth';

export default function HomeScreen() {
  const handleSOS = () => {
    Alert.alert('SOS', 'SOS pressed! (wire this to your real action)');
  };

  const handleSignOut = async () => {
    await auth().signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.sosWrap}>
          <Button title="SOS" variant="danger" onPress={handleSOS} style={styles.sosBtn} />
        </View>
        <Text style={{ marginTop: 16, opacity: 0.7 }}>You are signed in.</Text>
        <Button title="Sign out" variant="secondary" onPress={handleSignOut} style={{ marginTop: 16 }} />
      </View>
    </SafeAreaView>
  );
}

const SIZE = 200;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosWrap: { alignItems: 'center', justifyContent: 'center' },
  sosBtn: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
  },
});
