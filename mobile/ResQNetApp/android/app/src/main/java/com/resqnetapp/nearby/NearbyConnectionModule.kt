package com.resqnetapp.nearby

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
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
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * A React Native module for Google's Nearby Connections API.
 *
 * This module is refactored to exclusively use the P2P_CLUSTER strategy and to automatically
 * manage advertising when discovery is started or stopped.
 */
class NearbyConnectionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NearbyConnection"

    private val connectionsClient: ConnectionsClient = Nearby.getConnectionsClient(reactContext)
    private val deviceName: String = UUID.randomUUID().toString().take(8)

    // State management, similar to the ConnectionsActivity example.
    private var isDiscovering = false
    private var isAdvertising = false
    private var isConnecting = false

    private val establishedConnections = mutableMapOf<String, String>() // Endpoint ID -> Endpoint Name
    private val discoveredEndpoints = mutableMapOf<String, String>() // Endpoint ID -> Endpoint Name

    companion object {
        private const val TAG = "NearbyConnectionModule"
        private const val SERVICE_ID = "com.resqnetapp.nearby.service"
    }

    // --- React Methods ---

    /**
     * Starts advertising the device to nearby peers. This is now an internal function
     * called automatically by startDiscovering.
     */
	@ReactMethod
    fun startAdvertising() {
        if (isAdvertising) {
            log("Already advertising.")
            return
        }
        isAdvertising = true
        // Use high power mode for better cross-brand reliability.
        val advertisingOptions = AdvertisingOptions.Builder()
                .setStrategy(Strategy.P2P_CLUSTER)
                .setLowPower(false)
                .build()

        connectionsClient.startAdvertising(
            deviceName,
            SERVICE_ID,
            connectionLifecycleCallback,
            advertisingOptions
        ).addOnSuccessListener {
            log("Advertising started successfully.")
            sendEvent("onAdvertisingStarted", null)
        }.addOnFailureListener { e ->
            isAdvertising = false
            log("Advertising failed: ${e.message}")
            sendEvent("onAdvertisingFailed", createErrorMap(e.message))
        }
    }

    /** Stops advertising. Called automatically by stopDiscovering. */
    @ReactMethod
    fun stopAdvertising() {
        connectionsClient.stopAdvertising()
        isAdvertising = false
        log("Advertising stopped.")
    }

    /**
     * Starts discovering nearby devices and simultaneously starts advertising this device.
     */
    @ReactMethod
    fun startDiscovering() {
        if (isDiscovering) {
            log("Already discovering. Call stopDiscovering() first.")
            return
        }

        isDiscovering = true
        discoveredEndpoints.clear()
        // Use high power mode for better cross-brand reliability.
        val discoveryOptions = DiscoveryOptions.Builder()
                .setStrategy(Strategy.P2P_CLUSTER)
                .setLowPower(false)
                .build()

        connectionsClient.startDiscovery(
            SERVICE_ID,
            endpointDiscoveryCallback,
            discoveryOptions
        ).addOnSuccessListener {
            log("Discovery started successfully.")
            sendEvent("onDiscoveryStarted", null)
        }.addOnFailureListener { e ->
            isDiscovering = false
            // Also stop advertising if discovery fails to start.
            stopAdvertising()
            log("Discovery failed: ${e.message}")
            sendEvent("onDiscoveryFailed", createErrorMap(e.message))
        }
    }

    /** Stops discovering nearby devices and also stops advertising. */
    @ReactMethod
    fun stopDiscovering() {
        connectionsClient.stopDiscovery()
        isDiscovering = false
        log("Discovery stopped.")
        
        // Automatically stop advertising when discovery stops.
        stopAdvertising()
    }

    /**
     * Sends a connection request to a discovered endpoint.
     *
     * @param endpointId The ID of the remote endpoint to connect to.
     */
    @ReactMethod
    fun connectToEndpoint(endpointId: String) {
        if (isConnecting) {
            log("Cannot send a new connection request while another is in progress.")
            return
        }
        isConnecting = true
        log("Sending connection request to $endpointId")
        connectionsClient.requestConnection(deviceName, endpointId, connectionLifecycleCallback)
            .addOnFailureListener { e ->
                isConnecting = false
                log("Connection request to $endpointId failed: ${e.message}")
                val params = Arguments.createMap().apply {
                    putString("endpointId", endpointId)
                    putString("error", e.message)
                }
                sendEvent("onConnectionFailed", params)
            }
    }

    /**
     * Accepts an incoming connection request.
     *
     * @param endpointId The ID of the endpoint that sent the connection request.
     */
    @ReactMethod
    fun acceptConnection(endpointId: String) {
        log("Accepting connection from $endpointId")
        connectionsClient.acceptConnection(endpointId, payloadCallback)
            .addOnFailureListener { e ->
                log("Failed to accept connection from $endpointId: ${e.message}")
            }
    }

    /**
     * Rejects an incoming connection request.
     *
     * @param endpointId The ID of the endpoint that sent the connection request.
     */
    @ReactMethod
    fun rejectConnection(endpointId: String) {
        log("Rejecting connection from $endpointId")
        connectionsClient.rejectConnection(endpointId)
            .addOnFailureListener { e ->
                log("Failed to reject connection from $endpointId: ${e.message}")
            }
    }

    /**
     * Sends a text message to a connected endpoint.
     *
     * @param endpointId The ID of the recipient endpoint.
     * @param message The text message to send.
     */
    @ReactMethod
    fun sendMessage(endpointId: String, message: String) {
        log("Sending message to $endpointId: '$message'")
        val payload = Payload.fromBytes(message.toByteArray(StandardCharsets.UTF_8))
        connectionsClient.sendPayload(endpointId, payload)
            .addOnFailureListener { e ->
                log("Failed to send message to $endpointId: ${e.message}")
            }
    }

    /**
     * Disconnects from a specific endpoint.
     *
     * @param endpointId The ID of the endpoint to disconnect from.
     */
    @ReactMethod
    fun disconnectFromEndpoint(endpointId: String) {
        log("Disconnecting from $endpointId")
        connectionsClient.disconnectFromEndpoint(endpointId)
    }

    /** Disconnects from all endpoints and stops all advertising and discovery. */
    @ReactMethod
    fun stopAllEndpoints() {
        connectionsClient.stopAllEndpoints()
        isAdvertising = false
        isDiscovering = false
        isConnecting = false
        discoveredEndpoints.clear()
        establishedConnections.clear()
        log("Stopped all endpoints.")
    }

    // --- Callbacks ---

    /** Callback for handling connection lifecycle events. */
    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            log("Connection initiated with ${connectionInfo.endpointName} ($endpointId)")
            // Store the endpoint name for later use.
            discoveredEndpoints[endpointId] = connectionInfo.endpointName
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
                putString("endpointName", connectionInfo.endpointName)
                putString("authenticationToken", connectionInfo.authenticationToken)
            }
            sendEvent("onConnectionInitiated", params)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            isConnecting = false
            if (result.status.isSuccess) {
                log("Connection established with $endpointId")
                establishedConnections[endpointId] = discoveredEndpoints[endpointId] ?: "Unknown"
                val params = Arguments.createMap().apply {
                    putString("endpointId", endpointId)
                    putString("endpointName", establishedConnections[endpointId])
                }
                sendEvent("onConnectionEstablished", params)
            } else {
                log("Connection with $endpointId failed: ${result.status.statusMessage}")
                val params = Arguments.createMap().apply {
                    putString("endpointId", endpointId)
                    putString("error", result.status.statusMessage ?: "Unknown error")
                }
                sendEvent("onConnectionFailed", params)
            }
        }

        override fun onDisconnected(endpointId: String) {
            if (establishedConnections.containsKey(endpointId)) {
                log("Disconnected from $endpointId")
                establishedConnections.remove(endpointId)
                val params = Arguments.createMap().apply {
                    putString("endpointId", endpointId)
                }
                sendEvent("onDisconnected", params)
            }
        }
    }

    /** Callback for discovering endpoints. */
    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
            log("Endpoint found: ${info.endpointName} ($endpointId)")
            discoveredEndpoints[endpointId] = info.endpointName
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
                putString("endpointName", info.endpointName)
            }
            sendEvent("onEndpointFound", params)
        }

        override fun onEndpointLost(endpointId: String) {
            log("Endpoint lost: $endpointId")
            discoveredEndpoints.remove(endpointId)
            val params = Arguments.createMap().apply {
                putString("endpointId", endpointId)
            }
            sendEvent("onEndpointLost", params)
        }
    }

    /** Callback for receiving data payloads. */
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            if (payload.type == Payload.Type.BYTES) {
                val message = String(payload.asBytes()!!, StandardCharsets.UTF_8)
                log("Message received from $endpointId: '$message'")
                val params = Arguments.createMap().apply {
                    putString("endpointId", endpointId)
                    putString("message", message)
                }
                sendEvent("onMessageReceived", params)
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            // Not needed for simple text messages, but can be used for logging progress of larger payloads.
        }
    }

    // --- Helper Functions ---

    /** Sends an event to the JavaScript side. */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            log("Failed to send event '$eventName': ${e.message}")
        }
    }

    /** Creates a simple WritableMap for sending error messages. */
    private fun createErrorMap(message: String?): WritableMap {
        return Arguments.createMap().apply {
            putString("error", message ?: "Unknown error")
        }
    }

    /** Logs a debug message. */
    private fun log(message: String) {
        Log.d(TAG, message)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        // Ensure all connections are terminated when the React Native instance is destroyed.
        stopAllEndpoints()
    }
}

