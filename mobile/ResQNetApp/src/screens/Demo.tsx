import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  ScrollView,
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  NativeEventEmitter,
} from 'react-native';

const { NearbyConnection } = NativeModules;

interface Device {
  name: string;
  endpointId: string;
  isConnected?: boolean;
}

interface Message {
  endpointId: string;
  message: string;
  timestamp: Date;
  isOutgoing: boolean;
}

interface ConnectionRequest {
  endpointId: string;
  endpointName: string;
  authenticationToken: string;
  isIncomingConnection: boolean;
}

export default function Apu() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NearbyConnection);

    // Device discovery events
    const onEndpointFound = eventEmitter.addListener(
      'onEndpointFound',
      (device: Device) => {
        setDevices(prevDevices => {
          const exists = prevDevices.some(
            d => d.endpointId === device.endpointId,
          );
          return exists
            ? prevDevices
            : [...prevDevices, { ...device, isConnected: false }];
        });
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

    // Connection lifecycle events
    const onConnectionInitiated = eventEmitter.addListener(
      'onConnectionInitiated',
      (data: ConnectionRequest) => {
        if (data.isIncomingConnection) {
          setConnectionRequests(prev => [...prev, data]);
        }
      },
    );

    const onConnectionEstablished = eventEmitter.addListener(
      'onConnectionEstablished',
      (data: { endpointId: string }) => {
        setDevices(prevDevices =>
          prevDevices.map(d =>
            d.endpointId === data.endpointId ? { ...d, isConnected: true } : d,
          ),
        );
        // Remove from connection requests
        setConnectionRequests(prev =>
          prev.filter(req => req.endpointId !== data.endpointId),
        );
      },
    );

    const onConnectionFailed = eventEmitter.addListener(
      'onConnectionFailed',
      (data: { endpointId: string; status: string }) => {
        Alert.alert(
          'Connection Failed',
          `Failed to connect to ${data.endpointId}: ${data.status}`,
        );
        setConnectionRequests(prev =>
          prev.filter(req => req.endpointId !== data.endpointId),
        );
      },
    );

    const onDisconnected = eventEmitter.addListener(
      'onDisconnected',
      (data: { endpointId: string }) => {
        setDevices(prevDevices =>
          prevDevices.map(d =>
            d.endpointId === data.endpointId ? { ...d, isConnected: false } : d,
          ),
        );
        if (selectedDevice?.endpointId === data.endpointId) {
          setSelectedDevice(null);
        }
      },
    );

    // Messaging events
    const onMessageReceived = eventEmitter.addListener(
      'onMessageReceived',
      (data: { endpointId: string; message: string }) => {
        setMessages(prev => [
          ...prev,
          {
            endpointId: data.endpointId,
            message: data.message,
            timestamp: new Date(),
            isOutgoing: false,
          },
        ]);
      },
    );

    const onMessageSent = eventEmitter.addListener(
      'onMessageSent',
      (data: { endpointId: string; message: string }) => {
        setMessages(prev => [
          ...prev,
          {
            endpointId: data.endpointId,
            message: data.message,
            timestamp: new Date(),
            isOutgoing: true,
          },
        ]);
        setMessageText('');
      },
    );

    const onMessageSendFailed = eventEmitter.addListener(
      'onMessageSendFailed',
      (data: { endpointId: string; error: string }) => {
        Alert.alert(
          'Message Send Failed',
          `Failed to send message: ${data.error}`,
        );
      },
    );

    // Discovery/Advertising events
    const onDiscoveryStarted = eventEmitter.addListener(
      'onDiscoveryStarted',
      () => console.log('Discovery started successfully'),
    );

    const onAdvertisingStarted = eventEmitter.addListener(
      'onAdvertisingStarted',
      () => console.log('Advertising started successfully'),
    );

    const onConnectionRequested = eventEmitter.addListener(
      'onConnectionRequested',
      (data: { endpointId: string }) => {
        console.log('Connection requested to:', data.endpointId);
      },
    );

    return () => {
      onEndpointFound.remove();
      onEndpointLost.remove();
      onConnectionInitiated.remove();
      onConnectionEstablished.remove();
      onConnectionFailed.remove();
      onDisconnected.remove();
      onMessageReceived.remove();
      onMessageSent.remove();
      onMessageSendFailed.remove();
      onDiscoveryStarted.remove();
      onAdvertisingStarted.remove();
      onConnectionRequested.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log(PermissionsAndroid.PERMISSIONS);
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
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

  const startAdvertising = async () => {
    const hasPermissions = await requestPermissions();
    if (hasPermissions) {
      setIsAdvertising(true);
      NearbyConnection.startAdvertising();
      console.log('Starting advertising...');
    }
  };

  const stopAdvertising = () => {
    setIsAdvertising(false);
    NearbyConnection.stopAdvertising();
    console.log('Stopping advertising...');
  };

  const connectToDevice = (device: Device) => {
    NearbyConnection.connectToEndpoint(device.endpointId);
  };

  const acceptConnection = (request: ConnectionRequest) => {
    NearbyConnection.acceptConnection(request.endpointId);
  };

  const rejectConnection = (request: ConnectionRequest) => {
    NearbyConnection.rejectConnection(request.endpointId);
    setConnectionRequests(prev =>
      prev.filter(req => req.endpointId !== request.endpointId),
    );
  };

  const sendMessage = () => {
    if (selectedDevice && messageText.trim()) {
      NearbyConnection.sendMessage(
        selectedDevice.endpointId,
        messageText.trim(),
      );
    }
  };

  const disconnectFromDevice = (device: Device) => {
    NearbyConnection.disconnectFromEndpoint(device.endpointId);
  };

  const connectedDevices = devices.filter(d => d.isConnected);
  const availableDevices = devices.filter(d => !d.isConnected);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        ResQNet - Nearby Connections
      </Text>

      {/* Control Buttons */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Button
            title={isDiscovering ? 'Stop Discovery' : 'Start Discovery'}
            onPress={isDiscovering ? stopDiscovery : startDiscovery}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={isAdvertising ? 'Stop Advertising' : 'Start Advertising'}
            onPress={isAdvertising ? stopAdvertising : startAdvertising}
          />
        </View>
      </View>

      {/* Connection Requests */}
      {connectionRequests.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>
            Connection Requests ({connectionRequests.length}):
          </Text>
          {connectionRequests.map((request, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#444',
                padding: 10,
                marginBottom: 5,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {request.endpointName}
                </Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  ID: {request.endpointId}
                </Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  Token: {request.authenticationToken}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Button
                  title="Accept"
                  onPress={() => acceptConnection(request)}
                />
                <Button
                  title="Reject"
                  onPress={() => rejectConnection(request)}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Available Devices */}
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>
        Available Devices ({availableDevices.length}):
      </Text>

      {availableDevices.length === 0 ? (
        <Text style={{ color: '#666', fontStyle: 'italic', marginBottom: 20 }}>
          No devices found. Make sure nearby devices are advertising.
        </Text>
      ) : (
        <View style={{ marginBottom: 20 }}>
          {availableDevices.map((device, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#333',
                padding: 10,
                marginBottom: 5,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {device.name}
                </Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  ID: {device.endpointId}
                </Text>
              </View>
              <Button title="Connect" onPress={() => connectToDevice(device)} />
            </View>
          ))}
        </View>
      )}

      {/* Connected Devices */}
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>
        Connected Devices ({connectedDevices.length}):
      </Text>

      {connectedDevices.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          {connectedDevices.map((device, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#006600',
                padding: 10,
                marginBottom: 5,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {device.name}
                </Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  Connected - ID: {device.endpointId}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Button
                  title="Select"
                  onPress={() => setSelectedDevice(device)}
                />
                <Button
                  title="Disconnect"
                  onPress={() => disconnectFromDevice(device)}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Messaging Interface */}
      {selectedDevice && (
        <View style={{ backgroundColor: '#222', padding: 15, borderRadius: 5 }}>
          <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>
            Chat with: {selectedDevice.name}
          </Text>

          {/* Messages */}
          <ScrollView
            style={{
              maxHeight: 200,
              backgroundColor: '#111',
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            {messages
              .filter(m => m.endpointId === selectedDevice.endpointId)
              .map((msg, index) => (
                <Text
                  key={index}
                  style={{
                    color: msg.isOutgoing ? '#00ff00' : '#ffff00',
                    marginBottom: 5,
                  }}
                >
                  {msg.isOutgoing ? 'You' : selectedDevice.name}: {msg.message}
                  <Text style={{ color: '#666', fontSize: 10 }}>
                    {' (' + msg.timestamp.toLocaleTimeString() + ')'}
                  </Text>
                </Text>
              ))}
          </ScrollView>

          {/* Message Input */}
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#333',
                color: 'white',
                padding: 10,
                borderRadius: 5,
                marginRight: 10,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <Button
              title="Send"
              onPress={sendMessage}
              disabled={!messageText.trim()}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
