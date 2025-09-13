package com.resqnetapp.nearby

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.AdvertisingOptions
import com.google.android.gms.nearby.connection.ConnectionInfo
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback
import com.google.android.gms.nearby.connection.ConnectionResolution
import com.google.android.gms.nearby.connection.ConnectionsClient
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo
import com.google.android.gms.nearby.connection.DiscoveryOptions
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback
import com.google.android.gms.nearby.connection.Payload
import com.google.android.gms.nearby.connection.PayloadCallback
import com.google.android.gms.nearby.connection.PayloadTransferUpdate
import com.google.android.gms.nearby.connection.Strategy
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class NearbyConnectionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NearbyConnection"

    private val connectionsClient: ConnectionsClient = Nearby.getConnectionsClient(reactContext)
    private val serviceId = "com.resqnetapp"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startDiscovery() {
        val discoveryOptions = DiscoveryOptions.Builder().setStrategy(Strategy.P2P_CLUSTER).build()
        connectionsClient.startDiscovery(serviceId, endpointDiscoveryCallback, discoveryOptions)
            .addOnSuccessListener {
                sendEvent("onDiscoveryStarted", null)
            }
            .addOnFailureListener {
                sendEvent("onDiscoveryFailed", null)
            }
        
        // Also start advertising so this device can be discovered
        startAdvertising()
    }

    @ReactMethod
    fun stopDiscovery() {
        connectionsClient.stopDiscovery()
        connectionsClient.stopAdvertising()
    }

    @ReactMethod
    fun startAdvertising() {
        val advertisingOptions = AdvertisingOptions.Builder().setStrategy(Strategy.P2P_CLUSTER).build()
        connectionsClient.startAdvertising(android.os.Build.MODEL, serviceId, connectionLifecycleCallback, advertisingOptions)
            .addOnSuccessListener {
                sendEvent("onAdvertisingStarted", null)
            }
            .addOnFailureListener {
                sendEvent("onAdvertisingFailed", null)
            }
    }

    @ReactMethod
    fun stopAdvertising() {
        connectionsClient.stopAdvertising()
    }

    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, discoveredEndpointInfo: DiscoveredEndpointInfo) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            params.putString("name", discoveredEndpointInfo.endpointName)
            sendEvent("onEndpointFound", params)
        }

        override fun onEndpointLost(endpointId: String) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            sendEvent("onEndpointLost", params)
        }
    }

    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            // A payload was received
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            // A payload transfer update was received
        }
    }

    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            // A connection was initiated
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            // The result of a connection attempt
        }

        override fun onDisconnected(endpointId: String) {
            // An endpoint was disconnected
        }
    }
}