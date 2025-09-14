import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../ui/Button';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../app/navigation/types';
type Nav = NativeStackNavigationProp<AppStackParamList, 'TopTabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.sosWrap}>
          <Button
            title="SOS"
            variant="danger"
            onPress={() => navigation.navigate('SOS')}
            style={styles.sosBtn}
          />
        </View>
        <Text style={{ marginTop: 16, opacity: 0.7 }}>You are signed in.</Text>
      </View>
    </SafeAreaView>
  );
}

const SIZE = 200;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  map: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosWrap: { alignItems: 'center', justifyContent: 'center' },
  sosBtn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
