import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { initWifiP2p, discoverPeers } from './src/services/WifiP2pService';

export default function App() {
  useEffect(() => {
    initWifiP2p();
    return () => {
      // Remove listeners if needed
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Discover Peers" onPress={discoverPeers} />
      <Text>Check console for nearby devices and connection info</Text>
    </View>
  );
}
