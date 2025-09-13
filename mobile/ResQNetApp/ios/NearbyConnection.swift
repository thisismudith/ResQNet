import Foundation
import MultipeerConnectivity

@objc(NearbyConnection)
class NearbyConnection: RCTEventEmitter {

  private let serviceType = "resqnet-app"
  private var myPeerId: MCPeerID!
  private var serviceAdvertiser: MCNearbyServiceAdvertiser!
  private var serviceBrowser: MCNearbyServiceBrowser!
  private var session: MCSession!
  private var foundPeers: [MCPeerID] = []

  override init() {
    super.init()
    myPeerId = MCPeerID(displayName: UIDevice.current.name)
    session = MCSession(peer: myPeerId, securityIdentity: nil, encryptionPreference: .required)
    session.delegate = self
  }

  @objc
  func startDiscovery() {
    serviceBrowser = MCNearbyServiceBrowser(peer: myPeerId, serviceType: serviceType)
    serviceBrowser.delegate = self
    serviceBrowser.startBrowsingForPeers()
    sendEvent(withName: "onDiscoveryStarted", body: nil)
  }

  @objc
  func stopDiscovery() {
    serviceBrowser.stopBrowsingForPeers()
    serviceAdvertiser.stopAdvertisingPeer()
  }

  @objc
  func startAdvertising() {
    serviceAdvertiser = MCNearbyServiceAdvertiser(peer: myPeerId, discoveryInfo: nil, serviceType: serviceType)
    serviceAdvertiser.delegate = self
    serviceAdvertiser.startAdvertisingPeer()
    sendEvent(withName: "onAdvertisingStarted", body: nil)
  }

  @objc
  func stopAdvertising() {
    serviceAdvertiser.stopAdvertisingPeer()
  }

  @objc
  func connectToEndpoint(_ endpointId: String) {
    if let peer = foundPeers.first(where: { $0.displayName == endpointId }) {
      serviceBrowser.invitePeer(peer, to: session, withContext: nil, timeout: 30)
      let body = ["endpointId": endpointId]
      sendEvent(withName: "onConnectionRequested", body: body)
    }
  }

  @objc
  func acceptConnection(_ endpointId: String) {
    let body = ["endpointId": endpointId]
    sendEvent(withName: "onConnectionAccepted", body: body)
  }

  @objc
  func rejectConnection(_ endpointId: String) {
    let body = ["endpointId": endpointId]
    sendEvent(withName: "onConnectionRejected", body: body)
  }

  @objc
  func sendMessage(_ endpointId: String, message: String) {
    if let peer = session.connectedPeers.first(where: { $0.displayName == endpointId }) {
      do {
        let data = message.data(using: .utf8)!
        try session.send(data, toPeers: [peer], with: .reliable)
        let body = ["endpointId": endpointId, "message": message]
        sendEvent(withName: "onMessageSent", body: body)
      } catch {
        let body = ["endpointId": endpointId, "error": error.localizedDescription]
        sendEvent(withName: "onMessageSendFailed", body: body)
      }
    }
  }

  @objc
  func disconnectFromEndpoint(_ endpointId: String) {
    session.disconnect()
    let body = ["endpointId": endpointId]
    sendEvent(withName: "onDisconnectedFromEndpoint", body: body)
  }

  override func supportedEvents() -> [String]! {
    return [
      "onEndpointFound", "onEndpointLost", "onDiscoveryStarted", "onAdvertisingStarted",
      "onConnectionRequested", "onConnectionAccepted", "onConnectionRejected",
      "onConnectionInitiated", "onConnectionEstablished", "onConnectionFailed",
      "onDisconnected", "onMessageReceived", "onMessageSent", "onMessageSendFailed",
      "onDisconnectedFromEndpoint"
    ]
  }
}

extension NearbyConnection: MCNearbyServiceAdvertiserDelegate {
  func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
    let body = [
      "endpointId": peerID.displayName,
      "endpointName": peerID.displayName,
      "authenticationToken": "",
      "isIncomingConnection": true
    ] as [String : Any]
    sendEvent(withName: "onConnectionInitiated", body: body)
    
    // Auto-accept connections for simplicity
    invitationHandler(true, self.session)
  }
}

extension NearbyConnection: MCNearbyServiceBrowserDelegate {
  func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String : String]?) {
    foundPeers.append(peerID)
    let body = ["endpointId": peerID.displayName, "name": peerID.displayName]
    sendEvent(withName: "onEndpointFound", body: body)
  }

  func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
    foundPeers.removeAll { $0 == peerID }
    let body = ["endpointId": peerID.displayName]
    sendEvent(withName: "onEndpointLost", body: body)
  }
}

extension NearbyConnection: MCSessionDelegate {
  func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
    let body = ["endpointId": peerID.displayName]
    
    switch state {
    case .connected:
      sendEvent(withName: "onConnectionEstablished", body: body)
    case .connecting:
      break
    case .notConnected:
      sendEvent(withName: "onDisconnected", body: body)
    @unknown default:
      break
    }
  }

  func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
    if let message = String(data: data, encoding: .utf8) {
      let body = ["endpointId": peerID.displayName, "message": message]
      sendEvent(withName: "onMessageReceived", body: body)
    }
  }

  func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {
    let body = ["endpointId": peerID.displayName, "type": "stream"]
    sendEvent(withName: "onStreamReceived", body: body)
  }

  func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {
    let body = ["endpointId": peerID.displayName, "type": "file", "resourceName": resourceName]
    sendEvent(withName: "onFileReceived", body: body)
  }

  func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {
    let body = [
      "endpointId": peerID.displayName,
      "resourceName": resourceName,
      "error": error?.localizedDescription ?? ""
    ] as [String : Any]
    sendEvent(withName: "onFileTransferComplete", body: body)
  }
}