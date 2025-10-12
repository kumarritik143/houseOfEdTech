

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab'; // Custom tab with haptic feedback
import { IconSymbol } from '@/components/ui/icon-symbol'; // Custom icon component
import { Colors } from '@/constants/theme'; // Theme colors
import { useFullscreen } from '@/contexts/FullscreenContext'; // Fullscreen state management
import { useColorScheme } from '@/hooks/use-color-scheme'; // Device color scheme detection

/**
 * TabLayout Component
 * 
 * Creates the bottom tab navigation with two main screens:
 * 1. WebView tab (index) - Displays web content with notifications
 * 2. Video Player tab (explore) - HLS video player with controls
 * 
 * The tab bar automatically hides when video is in fullscreen mode.
 * 
 * @returns {JSX.Element} Tab navigation component
 */
export default function TabLayout() {
  // Get device color scheme for theme-aware styling
  const colorScheme = useColorScheme();
  
  // Get fullscreen state to conditionally hide tab bar
  const { isFullscreen } = useFullscreen();

  return (
    <Tabs
      screenOptions={{
        // Active tab color based on theme
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Hide header for custom styling
        headerShown: false,
        // Custom tab button with haptic feedback
        tabBarButton: HapticTab,
        // Hide tab bar when video is in fullscreen mode
        tabBarStyle: isFullscreen ? { display: 'none' } : undefined,
      }}>
      
      {/* WebView Tab - First tab */}
      <Tabs.Screen
        name="index"  // File: app/(tabs)/index.tsx
        options={{
          title: 'WebView',  // Tab label
          // Custom globe icon for web content
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="globe" color={color} />,
        }}
      />
      
      {/* Video Player Tab - Second tab */}
      <Tabs.Screen
        name="explore"  // File: app/(tabs)/explore.tsx
        options={{
          title: 'Video Player',  // Tab label
          // Custom play icon for video content
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
