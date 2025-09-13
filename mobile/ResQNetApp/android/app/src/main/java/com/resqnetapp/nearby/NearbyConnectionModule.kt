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

    @ReactMethod
    fun connectToEndpoint(endpointId: String) {
        connectionsClient.requestConnection("", endpointId, connectionLifecycleCallback)
            .addOnSuccessListener {
                val params = Arguments.createMap()
                params.putString("endpointId", endpointId)
                sendEvent("onConnectionRequested", params)
            }
            .addOnFailureListener {
                val params = Arguments.createMap()
                params.putString("endpointId", endpointId)
                params.putString("error", it.message)
                sendEvent("onConnectionRequestFailed", params)
            }
    }

    @ReactMethod
    fun acceptConnection(endpointId: String) {
        connectionsClient.acceptConnection(endpointId, payloadCallback)
        val params = Arguments.createMap()
        params.putString("endpointId", endpointId)
        sendEvent("onConnectionAccepted", params)
    }

    @ReactMethod
    fun rejectConnection(endpointId: String) {
        connectionsClient.rejectConnection(endpointId)
        val params = Arguments.createMap()
        params.putString("endpointId", endpointId)
        sendEvent("onConnectionRejected", params)
    }

    @ReactMethod
    fun sendMessage(endpointId: String, message: String) {
        val payload = Payload.fromBytes(message.toByteArray())
        connectionsClient.sendPayload(endpointId, payload)
            .addOnSuccessListener {
                val params = Arguments.createMap()
                params.putString("endpointId", endpointId)
                params.putString("message", message)
                sendEvent("onMessageSent", params)
            }
            .addOnFailureListener {
                val params = Arguments.createMap()
                params.putString("endpointId", endpointId)
                params.putString("error", it.message)
                sendEvent("onMessageSendFailed", params)
            }
    }

    @ReactMethod
    fun disconnectFromEndpoint(endpointId: String) {
        connectionsClient.disconnectFromEndpoint(endpointId)
        val params = Arguments.createMap()
        params.putString("endpointId", endpointId)
        sendEvent("onDisconnectedFromEndpoint", params)
    }

    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            when (payload.type) {
                Payload.Type.BYTES -> {
                    val message = String(payload.asBytes()!!)
                    val params = Arguments.createMap()
                    params.putString("endpointId", endpointId)
                    params.putString("message", message)
                    sendEvent("onMessageReceived", params)
                }
                Payload.Type.FILE -> {
                    val params = Arguments.createMap()
                    params.putString("endpointId", endpointId)
                    params.putString("type", "file")
                    sendEvent("onFileReceived", params)
                }
                Payload.Type.STREAM -> {
                    val params = Arguments.createMap()
                    params.putString("endpointId", endpointId)
                    params.putString("type", "stream")
                    sendEvent("onStreamReceived", params)
                }
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            params.putString("payloadId", update.payloadId.toString())
            params.putString("status", update.status.toString())
            params.putLong("bytesTransferred", update.bytesTransferred)
            params.putLong("totalBytes", update.totalBytes)
            sendEvent("onPayloadTransferUpdate", params)
        }
    }

    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            params.putString("endpointName", connectionInfo.endpointName)
            params.putString("authenticationToken", connectionInfo.authenticationToken)
            params.putBoolean("isIncomingConnection", connectionInfo.isIncomingConnection)
            sendEvent("onConnectionInitiated", params)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            params.putString("status", result.status.statusMessage)
            params.putInt("statusCode", result.status.statusCode)
            
            if (result.status.isSuccess) {
                sendEvent("onConnectionEstablished", params)
            } else {
                sendEvent("onConnectionFailed", params)
            }
        }

        override fun onDisconnected(endpointId: String) {
            val params = Arguments.createMap()
            params.putString("endpointId", endpointId)
            sendEvent("onDisconnected", params)
        }
    }
}