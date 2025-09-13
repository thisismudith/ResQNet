import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Text,
  NativeModules,
  PermissionsAndroid,
  Platform,
  NativeEventEmitter,
} from 'react-native';

const { NearbyConnection } = NativeModules;

interface Device {
  name: string;
  endpointId: string;
}

export default function Apu() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NearbyConnection);
    const onEndpointFound = eventEmitter.addListener(
      'onEndpointFound',
      (device: Device) => {
        setDevices(prevDevices => [...prevDevices, device]);
      },
    );

    const onEndpointLost = eventEmitter.addListener(
      'onEndpointLost',
      (device: { endpointId: string }) => {
        setDevices(prevDevices =>
          prevDevices.filter(d => d.endpointId !== device.endpointId),
        );
      },
    );

    return () => {
      onEndpointFound.remove();
      onEndpointLost.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log(PermissionsAndroid.PERMISSIONS);
        const granted = await PermissionsAndroid.requestMultiple([
          ...Object.values(PermissionsAndroid.PERMISSIONS),
        ]);
        console.log(granted);
        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.NEARBY_WIFI_DEVICES'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('You can use the nearby connections');
          return true;
        } else {
          console.log('Permissions denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startDiscovery = async () => {
    const hasPermissions = await requestPermissions();
    if (hasPermissions) {
      setIsDiscovering(true);
      NearbyConnection.startDiscovery();
      console.log('Starting discovery...');
    }
  };

  const stopDiscovery = () => {
    setIsDiscovering(false);
    NearbyConnection.stopDiscovery();
    console.log('Stopping discovery...');
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title={isDiscovering ? 'Stop Discovery' : 'Discover Peers'}
        onPress={isDiscovering ? stopDiscovery : startDiscovery}
      />
      <Text style={{ color: 'white', marginTop: 20 }}>Nearby devices:</Text>
      {devices.map((device, index) => (
        <Text key={index} style={{ color: 'white' }}>
          {device.name} - {device.endpointId}
        </Text>
      ))}
    </View>
  );
}
