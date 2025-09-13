import Foundation
import MultipeerConnectivity

@objc(NearbyConnection)
class NearbyConnection: RCTEventEmitter {

  private let serviceType = "resqnet-app"
  private var myPeerId: MCPeerID!
  private var serviceAdvertiser: MCNearbyServiceAdvertiser!
  private var serviceBrowser: MCNearbyServiceBrowser!
  private var session: MCSession!

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

  override func supportedEvents() -> [String]! {
    return ["onEndpointFound", "onEndpointLost"]
  }
}

extension NearbyConnection: MCNearbyServiceAdvertiserDelegate {
  func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
    invitationHandler(true, self.session)
  }
}

extension NearbyConnection: MCNearbyServiceBrowserDelegate {
  func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String : String]?) {
    let body = ["endpointId": peerID.displayName, "name": peerID.displayName]
    sendEvent(withName: "onEndpointFound", body: body)
  }

  func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
    let body = ["endpointId": peerID.displayName]
    sendEvent(withName: "onEndpointLost", body: body)
  }
}

extension NearbyConnection: MCSessionDelegate {
  func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
  }

  func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
  }

  func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {
  }

  func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {
  }

  func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {
  }
}