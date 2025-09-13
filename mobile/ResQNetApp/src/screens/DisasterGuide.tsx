import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function DisasterGuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Disaster Guide</Text>
      <Text>Checklist, how-tos, and offline tips go here.</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});
