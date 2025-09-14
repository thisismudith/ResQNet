import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../app/navigation/types.ts';
import Button from '../ui/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={require('../ic_launcher_round.png')}
          style={{ width: 100, height: 100, marginBottom: 16 }}
        />
        <Text style={styles.title}>Welcome to ResQNet</Text>
        <Text style={{ opacity: 0.7, textAlign: 'center' }}>
          You're not signed in. Continue to login with your mobile number.
        </Text>
      </View>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});
