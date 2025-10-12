

import { ThemedText } from '@/components/themed-text'; // Theme-aware text component
import { ThemedView } from '@/components/themed-view'; // Theme-aware view component
import * as Notifications from 'expo-notifications'; // Notification management
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Safe area handling
import { WebView } from 'react-native-webview'; // Web content display

// Configure notification behavior for the entire app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // Show alert when notification is received
    shouldPlaySound: true,  // Play sound for notifications
    shouldSetBadge: false,    // Don't set app badge
    shouldShowBanner: true,   // Show banner notification
    shouldShowList: true,     // Show in notification list
  }),
});

/**
 * WebViewScreen Component
 * 
 * Main component for the WebView tab that displays houseofedtech.in
 * and provides notification testing functionality.
 * 
 * @returns {JSX.Element} WebView screen with notification controls
 */
export default function WebViewScreen() {
  // State to track if WebView has finished loading
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  
  // Get safe area insets for proper spacing on devices with notches
  const insets = useSafeAreaInsets();

  // Request notification permissions when component mounts
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  /**
   * Request notification permissions from the user
   * This is required to send local notifications
   */
  const registerForPushNotificationsAsync = async () => {
    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Show alert if permissions are denied
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
  };

  /**
   * Schedule a local notification with custom content
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {number} delay - Delay in seconds before showing notification
   */
  const scheduleNotification = async (title: string, body: string, delay: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen: 'video' }, // Metadata for navigation (bonus feature)
      },
      trigger: { seconds: delay } as any,  // Delay trigger
    });
  };

  /**
   * Handle first notification button press
   * Schedules a welcome notification with 3-second delay
   */
  const handleNotification1 = () => {
    scheduleNotification(
      'Welcome Notification! 🎉',
      'This is your first notification from the WebView page!',
      3
    );
  };

  /**
   * Handle second notification button press
   * Schedules a success notification with 5-second delay
   */
  const handleNotification2 = () => {
    scheduleNotification(
      'Success Notification! ✅',
      'Great job! You triggered the second notification.',
      5
    );
  };

  /**
   * Handle WebView load completion
   * Sets loaded state and triggers auto-notification (bonus feature)
   */
  const handleWebViewLoad = () => {
    setWebViewLoaded(true);
    // Bonus: Send notification when WebView finishes loading
    scheduleNotification(
      'WebView Loaded! 📱',
      'The website has finished loading successfully.',
      2
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedText type="title" style={styles.title}>
        WebView
      </ThemedText>
      
      <ThemedView style={styles.webViewContainer}>
        <WebView
          source={{ uri: 'https://houseofedtech.in/' }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNotification1}>
          <ThemedText style={styles.buttonText}>Trigger Notification 1</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleNotification2}>
          <ThemedText style={styles.buttonText}>Trigger Notification 2</ThemedText>
        </TouchableOpacity>
      </ThemedView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  webViewContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webView: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
