import { NativeModules, NativeEventEmitter, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const { NearbyConnection } = NativeModules;

interface Device {
  name: string;
  endpointId: string;
  isConnected?: boolean;
}

interface Message {
  deviceId: string;
  message: string;
}

interface ConnectionRequest {
  endpointId: string;
  endpointName: string;
  authenticationToken: string;
  isIncomingConnection: boolean;
}

type ListenerFn<T> = (data: T) => void;

export default class CORE {
  private eventEmitter: NativeEventEmitter;
  private subscriptions: any[];

  geoX: number;
  geoY: number;
  timeStamp: number;

  isActive: boolean;
  devices: Device[];
  connectionRequests: ConnectionRequest[];
  receivedMessage: Message[];
  broadcastedMsgIndex: number;

  // UI hooks
  onDevicesChanged?: ListenerFn<Device[]>;
  onRequestsChanged?: ListenerFn<ConnectionRequest[]>;
  onMessagesChanged?: ListenerFn<Message[]>;
  location: any;
  timestamp: any;

  constructor() {
	this.geoX = 0;
	this.geoY = 0;
	this.timeStamp = 0;

	this.isActive = false;

	this.devices = []; // Discovered devices
	this.subscriptions = []; // Event subscriptions
	this.connectionRequests = []; // Pending connection requests
	this.receivedMessage = []; // Received messages
	this.broadcastedMsgIndex = 0;

	this.eventEmitter = new NativeEventEmitter(NearbyConnection);
  }

  initialize() {
	this.subscriptions.push(
	  this.eventEmitter.addListener('onEndpointFound', (device: Device) => {
		console.log('[onEndpointFound]', device);
		const exists = this.devices.some(
		  d => d.endpointId === device.endpointId,
		);
		if (exists) return;
		this.devices.push({ ...device, isConnected: false });
		if (this.isActive) {
		  NearbyConnection.connectToEndpoint(device.endpointId);
		}
	  }),
	);

	this.subscriptions.push(
	  this.eventEmitter.addListener(
		'onEndpointLost',
		(data: { endpointId: string }) => {
		  console.log('[onEndpointLost]', data);
		  this.devices = this.devices.filter(
			d => d.endpointId !== data.endpointId,
		  );
		},
	  ),
	);

	this.subscriptions.push(
	  this.eventEmitter.addListener(
		'onConnectionInitiated',
		(req: ConnectionRequest) => {
		  console.log('[onConnectionInitiated]', req);
		  if (this.isActive) {
			NearbyConnection.acceptConnection(req.endpointId);
		  } else {
			this.connectionRequests.push(req);
			this.onRequestsChanged?.([...this.connectionRequests]);
		  }
		},
	  ),
	);

	this.subscriptions.push(
	  this.eventEmitter.addListener(
		'onConnectionEstablished',
		(data: { endpointId: string }) => {
		  const device = this.devices.find(
			d => d.endpointId === data.endpointId,
		  );
		  if (device) {
			device.isConnected = true;
		  }
		},
	  ),
	);

	this.subscriptions.push(
	  this.eventEmitter.addListener(
		'onMessageReceived',
		(data: { deviceId: string; message: string }) => {
		  if (
			this.receivedMessage.some(
			  msg =>
				msg.deviceId === data.deviceId && msg.message === data.message,
			)
		  )
			return; // Skip duplicates
		  this.receivedMessage.push({
			deviceId: data.deviceId,
			message: data.message,
		  });
		},
	  ),
	);

	NearbyConnection.startDiscovering();
  }

  start() {
	this.isActive = true;
	NearbyConnection.startAdvertising();
  }

  loop() {
	if (!this.isActive) return;
	this.fetchLocation();
	this.receivedMessage.push({
	  deviceId: 'self', // TODO: replace with actual device ID
	  message: `${this.geoX},${this.geoY}|${this.timeStamp}`,
	});

	setTimeout(() => this.loop(), this.wait_interval() || 5e3);
  }

  loop2() {
	// Check if we have to send a message
	if (
	  !this.isActive &&
	  this.broadcastedMsgIndex == this.receivedMessage.length
	)
	  return;
	//   Send message logic
	if (!this.toInternet()) {
	  this.broadcast();
	}
	setTimeout(() => this.loop2(), 100); // This loop runs more frequently
  }

  stop() {
	this.isActive = false;
	NearbyConnection.stopAdvertising();
  }

  wait_interval() {
	// Example: adaptive backoff
	// const delta = distance_moved_since_last(this.geoX, this.geoY);
	const delta = 0; // Placeholder...
	return Math.max(0.1, Math.min(5, 5 - delta));
  }

  toInternet(): boolean {
	// Try sending location + messages to server
	// Return true if success, false if fail
	return false;
  }

  broadcast() {
	// If toInternet() fails, rebroadcast locally
	this.devices.forEach(d => {
	  if (d.isConnected === false) return;
	  this.receivedMessage.forEach(msg => {
		NearbyConnection.sendMessage(d.endpointId, JSON.stringify(msg));
	  });
	});
  }

  fetchLocation() {
	Geolocation.getCurrentPosition(
	  pos => {
		this.geoX = pos.coords.longitude;
		this.geoY = pos.coords.latitude;
		this.timestamp = pos.timestamp;
	  },
	  error => {
		this.timestamp = 0;
		console.error('Error fetching location:', error);
	  },
	);
  }

  handleConnection(req: ConnectionRequest) {
	if (this.isActive) {
	  NearbyConnection.acceptConnection(req.endpointId);
	} else {
	  Alert.alert('Connection Request', `From ${req.endpointName}`);
	}
  }

  cleanup() {
	this.subscriptions.forEach(s => s.remove());
	this.stop();
	NearbyConnection.stopDiscovering();
  }
}
