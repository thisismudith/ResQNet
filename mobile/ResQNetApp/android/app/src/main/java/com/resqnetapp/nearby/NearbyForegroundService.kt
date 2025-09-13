package com.resqnetapp.nearby

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.resqnetapp.R

class NearbyForegroundService : Service() {

    companion object {
        private const val TAG = "NearbyForegroundService"
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "NearbyConnectionChannel"
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Foreground service created.")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Starting foreground service.")
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        // If the service is killed, it will be automatically restarted.
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        // This is a non-binding service.
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Foreground service destroyed.")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Nearby Connections Status",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ResQNet Active")
            .setContentText("Searching for nearby devices...")
            .setSmallIcon(R.mipmap.ic_launcher) // Ensure you have this icon
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
    }
}