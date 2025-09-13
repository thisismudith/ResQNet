package com.resqnetapp.nearby

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.wifi.WifiManager
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class NearbyPermissionHelper(private val context: Context) {
    
    companion object {
        private const val TAG = "NearbyPermissionHelper"
        private const val REQUEST_CODE_PERMISSIONS = 1001
        private const val REQUEST_CODE_ENABLE_BT = 1002
        private const val REQUEST_CODE_ENABLE_LOCATION = 1003
        private const val REQUEST_CODE_ENABLE_WIFI = 1004
    }
    
    private val bluetoothManager: BluetoothManager? = 
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter
    private val locationManager: LocationManager = 
        context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    private val wifiManager: WifiManager = 
        context.getSystemService(Context.WIFI_SERVICE) as WifiManager
    
    /**
     * Get all required permissions based on Android version
     */
    fun getRequiredPermissions(): Array<String> {
        val permissions = mutableListOf<String>()
        
        // Location permissions (always required for nearby discovery)
        permissions.add(Manifest.permission.ACCESS_FINE_LOCATION)
        permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        
        // Bluetooth permissions based on API level
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ permissions - new runtime permissions model
            permissions.add(Manifest.permission.BLUETOOTH_ADVERTISE)
            permissions.add(Manifest.permission.BLUETOOTH_CONNECT)
            permissions.add(Manifest.permission.BLUETOOTH_SCAN)
        } else {
            // Pre-Android 12 permissions - legacy model
            permissions.add(Manifest.permission.BLUETOOTH)
            permissions.add(Manifest.permission.BLUETOOTH_ADMIN)
        }
        
        // Wi-Fi permissions for better cross-brand compatibility
        permissions.add(Manifest.permission.ACCESS_WIFI_STATE)
        permissions.add(Manifest.permission.CHANGE_WIFI_STATE)
        
        // Android 13+ Wi-Fi device permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.NEARBY_WIFI_DEVICES)
        }
        
        // Brand-specific additional permissions that some manufacturers require
        // These are generally granted automatically but help with some edge cases
        try {
            // Some Samsung devices need this for BLE discovery
            if (Build.MANUFACTURER.equals("samsung", ignoreCase = true)) {
                permissions.add("android.permission.BLUETOOTH_PRIVILEGED")
            }
            
            // Some Chinese brands (Oppo, Vivo, OnePlus, etc.) may need background activity permission
            if (Build.MANUFACTURER.lowercase() in listOf("oppo", "vivo", "oneplus", "realme", "iqoo")) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    permissions.add("android.permission.FOREGROUND_SERVICE")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error adding brand-specific permissions: ${e.message}")
        }
        
        return permissions.toTypedArray()
    }
    
    /**
     * Check if all required permissions are granted
     */
    fun hasAllPermissions(): Boolean {
        return getRequiredPermissions().all { permission ->
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }
    
    /**
     * Get list of missing permissions
     */
    fun getMissingPermissions(): List<String> {
        return getRequiredPermissions().filter { permission ->
            ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED
        }
    }
    
    /**
     * Request permissions from activity
     */
    fun requestPermissions(activity: Activity) {
        val missingPermissions = getMissingPermissions()
        if (missingPermissions.isNotEmpty()) {
            Log.d(TAG, "Requesting permissions: ${missingPermissions.joinToString()}")
            ActivityCompat.requestPermissions(
                activity,
                missingPermissions.toTypedArray(),
                REQUEST_CODE_PERMISSIONS
            )
        }
    }
    
    /**
     * Check if Bluetooth is enabled
     */
    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled == true
    }
    
    /**
     * Check if location services are enabled
     */
    fun isLocationEnabled(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            locationManager.isLocationEnabled
        } else {
            @Suppress("DEPRECATION")
            val mode = Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.LOCATION_MODE,
                Settings.Secure.LOCATION_MODE_OFF
            )
            mode != Settings.Secure.LOCATION_MODE_OFF
        }
    }
    
    /**
     * Check if Wi-Fi is enabled
     */
    fun isWifiEnabled(): Boolean {
        return wifiManager.isWifiEnabled
    }
    
    /**
     * Enable Bluetooth with user prompt
     */
    fun enableBluetooth(activity: Activity): Boolean {
        if (!isBluetoothEnabled()) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    // For Android 12+, we need BLUETOOTH_CONNECT permission
                    if (ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT)
                        == PackageManager.PERMISSION_GRANTED) {
                        val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                        activity.startActivityForResult(enableBtIntent, REQUEST_CODE_ENABLE_BT)
                        return false
                    } else {
                        Log.w(TAG, "BLUETOOTH_CONNECT permission not granted")
                        return false
                    }
                } else {
                    // Pre-Android 12, direct enable attempt
                    val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                    activity.startActivityForResult(enableBtIntent, REQUEST_CODE_ENABLE_BT)
                    return false
                }
            } catch (e: SecurityException) {
                Log.e(TAG, "SecurityException when trying to enable Bluetooth: ${e.message}")
                // Try alternative approach for some brands
                try {
                    if (bluetoothAdapter?.enable() == true) {
                        return true
                    }
                } catch (e2: Exception) {
                    Log.e(TAG, "Failed to enable Bluetooth programmatically: ${e2.message}")
                }
                return false
            }
        }
        return true
    }
    
    /**
     * Prompt user to enable location services
     */
    fun enableLocation(activity: Activity) {
        if (!isLocationEnabled()) {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            activity.startActivityForResult(intent, REQUEST_CODE_ENABLE_LOCATION)
        }
    }
    
    /**
     * Enable Wi-Fi if possible
     */
    fun enableWifi(): Boolean {
        if (!isWifiEnabled()) {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ doesn't allow apps to enable Wi-Fi directly
                false
            } else {
                @Suppress("DEPRECATION")
                wifiManager.isWifiEnabled = true
                true
            }
        }
        return true
    }
    
    /**
     * Get comprehensive device readiness status
     */
    fun getDeviceReadiness(): DeviceReadiness {
        return DeviceReadiness(
            hasAllPermissions = hasAllPermissions(),
            missingPermissions = getMissingPermissions(),
            isBluetoothEnabled = isBluetoothEnabled(),
            isLocationEnabled = isLocationEnabled(),
            isWifiEnabled = isWifiEnabled(),
            bluetoothSupported = bluetoothAdapter != null,
            deviceInfo = getDeviceInfo()
        )
    }
    
    /**
     * Get device information for debugging
     */
    fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            brand = Build.BRAND,
            device = Build.DEVICE,
            sdkVersion = Build.VERSION.SDK_INT,
            release = Build.VERSION.RELEASE,
            hasBluetoothLe = context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE),
            hasWifiDirect = context.packageManager.hasSystemFeature(PackageManager.FEATURE_WIFI_DIRECT)
        )
    }
    
    data class DeviceReadiness(
        val hasAllPermissions: Boolean,
        val missingPermissions: List<String>,
        val isBluetoothEnabled: Boolean,
        val isLocationEnabled: Boolean,
        val isWifiEnabled: Boolean,
        val bluetoothSupported: Boolean,
        val deviceInfo: DeviceInfo
    )
    
    data class DeviceInfo(
        val manufacturer: String,
        val model: String,
        val brand: String,
        val device: String,
        val sdkVersion: Int,
        val release: String,
        val hasBluetoothLe: Boolean,
        val hasWifiDirect: Boolean
    )
}