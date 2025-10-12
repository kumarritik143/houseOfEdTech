

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated'; // Required for animations

import { FullscreenProvider } from '@/contexts/FullscreenContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Expo Router configuration - sets the main entry point
export const unstable_settings = {
  anchor: '(tabs)',  // Main navigation starts with tabs
};

/**
 * RootLayout Component
 * 
 * The root component that wraps the entire app with necessary providers and navigation.
 * This component is responsible for:
 * - Providing fullscreen context to all child components
 * - Setting up theme based on device color scheme
 * - Configuring navigation stack
 * - Managing status bar appearance
 * 
 * @returns {JSX.Element} The root layout with all providers and navigation
 */
export default function RootLayout() {
  // Get device color scheme (light/dark mode)
  const colorScheme = useColorScheme();

  return (
    // FullscreenProvider: Provides fullscreen state to entire app
    <FullscreenProvider>
      {/* ThemeProvider: Manages light/dark theme based on device settings */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Stack Navigator: Main navigation structure */}
        <Stack>
          {/* Main tabs screen - hidden header for custom styling */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Modal screen for future modal presentations */}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {/* StatusBar: Automatically adapts to theme */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </FullscreenProvider>
  );
}
