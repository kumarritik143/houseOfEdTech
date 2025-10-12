# React Native Expo Assignment: WebView + Notifications + Video Player

## 🎯 Project Overview

This Expo React Native app demonstrates the integration of WebView, local notifications, and HLS video playback. The app consists of two main screens with seamless navigation between them.

## 🛠 Features Implemented

### 1. WebView Page (`app/(tabs)/index.tsx`)
- **Embedded Website**: Displays https://expo.dev using React Native WebView
- **Notification Buttons**: Two buttons that trigger different local notifications
- **Auto-notification**: Sends a notification when the WebView finishes loading (bonus feature)
- **Navigation**: Button to navigate to the Video Player page

### 2. Video Player Page (`app/(tabs)/explore.tsx`)
- **HLS Stream**: Plays the test HLS stream from `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
- **Custom Controls**: 
  - Play/Pause functionality
  - Skip forward/backward (10 seconds)
  - Mute/Unmute toggle
  - Restart button
  - Time display (current/total duration)
- **Notification Integration**: Listens for notification taps and shows alerts (bonus feature)

### 3. Notifications System
- **Permission Handling**: Automatically requests notification permissions on app start
- **Scheduled Notifications**: Two distinct notification types with 3-5 second delays
- **Notification Data**: Includes screen navigation data for bonus features
- **Visual Feedback**: Shows alerts when notifications are tapped

### 4. Navigation
- **Tab Navigation**: Bottom tab bar with WebView and Video Player tabs
- **Cross-page Navigation**: Buttons on each page to navigate to the other
- **Icon Integration**: Custom icons for each tab (globe for WebView, play button for Video)

## ⭐ Bonus Features Implemented

1. **WebView Load Notification**: Automatically sends a notification when the WebView finishes loading
2. **Notification Navigation**: Tapping notifications shows alerts and can navigate to the Video Player
3. **Custom Video Controls**: Advanced controls including seek, skip, mute, and restart functionality
4. **Time Display**: Shows current playback time and total duration
5. **Responsive Design**: Clean, modern UI with proper spacing and colors

## 🏗 Technical Implementation

### Dependencies Used
- `react-native-webview`: For embedding web content
- `expo-notifications`: For local notification management
- `expo-av`: For HLS video playback
- `expo-router`: For navigation between screens
- `@expo/vector-icons`: For tab bar icons

### Key Implementation Choices

1. **WebView Configuration**:
   - Enabled JavaScript and DOM storage for full website functionality
   - Added load event handler for bonus notification feature

2. **Notification System**:
   - Used `expo-notifications` for cross-platform compatibility
   - Implemented proper permission handling
   - Added notification response listeners for bonus features

3. **Video Player**:
   - Used `expo-av` Video component for HLS support
   - Disabled native controls to implement custom UI
   - Added comprehensive playback status monitoring

4. **Navigation**:
   - Leveraged Expo Router's file-based routing
   - Used tab navigation for main app structure
   - Added programmatic navigation between screens

## 🚀 Running the App

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Testing Instructions

1. **WebView Page**:
   - Wait for the website to load (notification will appear automatically)
   - Tap the notification buttons to trigger delayed notifications
   - Use the navigation button to go to Video Player

2. **Video Player Page**:
   - Use the play/pause button to control playback
   - Try the skip buttons to jump forward/backward
   - Test the mute functionality
   - Use restart to go back to the beginning

3. **Notifications**:
   - Allow notification permissions when prompted
   - Wait for notifications to appear (2-5 second delays)
   - Tap notifications to see alert messages

## 🎨 UI/UX Design Choices

- **Color Scheme**: Used iOS-style colors (blue, green, orange) for consistency
- **Button Design**: Rounded corners with proper padding for touch targets
- **Layout**: Flexbox-based responsive design
- **Typography**: Clear, readable text with appropriate font weights
- **Icons**: Emoji-based icons for universal compatibility

## 🔧 Future Enhancements

- Add video quality selection
- Implement playlist functionality
- Add notification scheduling options
- Include video progress bar
- Add fullscreen video support
- Implement video caching for offline playback

## 📄 License

This project is created for educational purposes as part of a React Native Expo assignment.