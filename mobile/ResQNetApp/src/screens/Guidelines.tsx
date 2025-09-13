import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function DisasterGuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Guidelines</Text>
      <Text>Checklist, how-tos, and offline tips go here.</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});
