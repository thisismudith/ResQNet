import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function VolunteerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Network</Text>
      <Text>Find tasks and report availability here.</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});
