import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { NearbyConnection } = NativeModules;

interface DeviceInfo {
  manufacturer: string;
  model: string;
  brand: string;
  device: string;
  sdkVersion: number;
  release: string;
  hasBluetoothLe: boolean;
  hasWifiDirect: boolean;
}

interface DeviceReadiness {
  hasAllPermissions: boolean;
  missingPermissions: string[];
  isBluetoothEnabled: boolean;
  isLocationEnabled: boolean;
  isWifiEnabled: boolean;
  bluetoothSupported: boolean;
  deviceInfo: DeviceInfo;
}

interface EndpointInfo {
  endpointId: string;
  name: string;
  serviceId?: string;
}

interface ConnectionInfo {
  endpointId: string;
  endpointName: string;
  authenticationToken: string;
  isIncomingConnection: boolean;
}

interface DiagnosticResult {
  test: string;
  passed: boolean;
  details: string;
}

export type NearbyConnectionEvents =
  | 'onDiscoveryStarted'
  | 'onDiscoveryFailed'
  | 'onAdvertisingStarted'
  | 'onAdvertisingFailed'
  | 'onEndpointFound'
  | 'onEndpointLost'
  | 'onConnectionInitiated'
  | 'onConnectionEstablished'
  | 'onConnectionFailed'
  | 'onConnectionRequested'
  | 'onConnectionRequestFailed'
  | 'onConnectionAccepted'
  | 'onConnectionAcceptFailed'
  | 'onConnectionRejected'
  | 'onMessageReceived'
  | 'onMessageSent'
  | 'onMessageSendFailed'
  | 'onFileReceived'
  | 'onStreamReceived'
  | 'onPayloadTransferUpdate'
  | 'onDisconnected'
  | 'onDisconnectedFromEndpoint'
  | 'onDeviceInfo'
  | 'onDeviceReadiness'
  | 'onDebugLog'
  | 'onPermissionRequestFailed'
  | 'onBluetoothEnableResult'
  | 'onBluetoothEnableFailed'
  | 'onLocationEnableFailed'
  | 'onWifiEnableResult'
  | 'onDiagnosticComplete'
  | 'onCompatibilityModeEnabled';

class NearbyConnectionService {
  private eventEmitter: NativeEventEmitter;
  private listeners: Map<string, EmitterSubscription> = new Map();

  constructor() {
    this.eventEmitter = new NativeEventEmitter(NearbyConnection);
  }

  // Core discovery methods
  startDiscovery(): void {
    NearbyConnection.startDiscovery();
  }

  stopDiscovery(): void {
    NearbyConnection.stopDiscovery();
  }

  startAdvertising(): void {
    NearbyConnection.startAdvertising();
  }

  stopAdvertising(): void {
    NearbyConnection.stopAdvertising();
  }

  // Connection methods
  connectToEndpoint(endpointId: string): void {
    NearbyConnection.connectToEndpoint(endpointId);
  }

  acceptConnection(endpointId: string): void {
    NearbyConnection.acceptConnection(endpointId);
  }

  rejectConnection(endpointId: string): void {
    NearbyConnection.rejectConnection(endpointId);
  }

  disconnectFromEndpoint(endpointId: string): void {
    NearbyConnection.disconnectFromEndpoint(endpointId);
  }

  // Messaging methods
  sendMessage(endpointId: string, message: string): void {
    NearbyConnection.sendMessage(endpointId, message);
  }

  // Device and permission methods
  getDeviceInfo(): void {
    NearbyConnection.getDeviceInfo();
  }

  checkDeviceReadiness(): void {
    NearbyConnection.checkDeviceReadiness();
  }

  requestPermissions(): void {
    NearbyConnection.requestPermissions();
  }

  enableBluetooth(): void {
    NearbyConnection.enableBluetooth();
  }

  enableLocation(): void {
    NearbyConnection.enableLocation();
  }

  enableWifi(): void {
    NearbyConnection.enableWifi();
  }

  // Utility methods
  restartWithNewStrategy(): void {
    NearbyConnection.restartWithNewStrategy();
  }

  getAllEndpoints(): void {
    NearbyConnection.getAllEndpoints();
  }

  diagnosticTest(): void {
    NearbyConnection.diagnosticTest();
  }

  forceBrandCompatibilityMode(): void {
    NearbyConnection.forceBrandCompatibilityMode();
  }

  // Event management
  addEventListener<T>(
    eventType: NearbyConnectionEvents,
    callback: (data: T) => void
  ): void {
    const listener = this.eventEmitter.addListener(eventType, callback);
    this.listeners.set(eventType, listener);
  }

  removeEventListener(eventType: NearbyConnectionEvents): void {
    const listener = this.listeners.get(eventType);
    if (listener) {
      listener.remove();
      this.listeners.delete(eventType);
    }
  }

  removeAllListeners(): void {
    this.listeners.forEach((listener) => listener.remove());
    this.listeners.clear();
  }

  // Helper methods for better cross-brand compatibility
  async setupDevice(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check device readiness first
      this.addEventListener<DeviceReadiness>('onDeviceReadiness', (readiness) => {
        console.log('Device readiness:', readiness);
        
        if (!readiness.hasAllPermissions) {
          console.log('Missing permissions:', readiness.missingPermissions);
          this.requestPermissions();
          resolve(false);
          return;
        }

        if (!readiness.isBluetoothEnabled) {
          console.log('Bluetooth not enabled');
          this.enableBluetooth();
          resolve(false);
          return;
        }

        if (!readiness.isLocationEnabled) {
          console.log('Location not enabled');
          this.enableLocation();
          resolve(false);
          return;
        }

        resolve(true);
      });

      this.checkDeviceReadiness();
    });
  }

  async startDiscoveryWithSetup(): Promise<boolean> {
    const isReady = await this.setupDevice();
    if (isReady) {
      this.startDiscovery();
      return true;
    }
    return false;
  }

  // Debug logging helper
  enableDebugLogging(callback?: (message: string) => void): void {
    this.addEventListener<{ message: string }>('onDebugLog', (data) => {
      console.log('[NearbyConnection]', data.message);
      if (callback) {
        callback(data.message);
      }
    });
  }

  // Cross-brand discovery helper with automatic retry
  startRobustDiscovery(): void {
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 3000;

    const attemptDiscovery = () => {
      console.log(`Starting discovery attempt ${retryCount + 1}`);
      
      this.addEventListener('onDiscoveryStarted', () => {
        console.log('Discovery started successfully');
        retryCount = 0; // Reset on success
      });

      this.addEventListener('onDiscoveryFailed', () => {
        console.log('Discovery failed, retrying...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => {
            this.restartWithNewStrategy();
          }, retryDelay);
        } else {
          console.log('Max retries reached for discovery');
        }
      });

      this.startDiscovery();
    };

    attemptDiscovery();
  }
}

export default new NearbyConnectionService();
export type {
  DeviceInfo,
  DeviceReadiness,
  EndpointInfo,
  ConnectionInfo,
  DiagnosticResult
};