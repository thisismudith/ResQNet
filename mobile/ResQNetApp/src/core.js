export default class CORE {
  constructor(parameters) {
    this.geoX = 0;
    this.geoY = 0;
    this.lastTimeStamp = 0;

    this.isActive = false;

    this.devices = []; // Nearby devices...
    this.connectionRequests = [];
  }

  initialize() {
    // Setup all the subscriptions...
    // Setup all the discovery...
  }

  start() {
    this.isActive = true;
    // Start Advertising
  }

  stop() {
    this.isActive = false;
    // Stop Advertising
  }

  wait_interval() {
    // Calculating how much time we wait before broadcasting location again
    // 5s - delta (location) <- The more the location changes, the more often we broadcast
    // Min interval is .1s, max is 5s
  }

  toInternet() {
    // Send location + message to server...
    // Returns wheter the attempt was successfull.
  }

  broadcast() {
    // Loop through our connections and broadcast our location + received message to each connection.
    // Only called if toInternet() fails.
  }

  fetchLocation() {
    // Get location code...

    this.geoX = 0;
    this.geoY = 0;
    this.lastTimeStamp = 0;
  }

  handleConnection() {
    // This is where we handle the code for connections from phones
    // If the code is active and we receive a connection, auto accept.
    // If not active, send a notification to the user.
  }

  cleanup() {
    this.subscriptions.forEach(s => s.remove());
    this.stopDiscovery();
  }
}
