

import { ThemedText } from '@/components/themed-text'; // Theme-aware text component
import { ThemedView } from '@/components/themed-view'; // Theme-aware view component
import { useFullscreen } from '@/contexts/FullscreenContext'; // Global fullscreen state
import { Ionicons } from '@expo/vector-icons'; // Icon library
import Slider from '@react-native-community/slider'; // Custom slider for seeking
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av'; // Video playback
import * as Notifications from 'expo-notifications'; // Notification handling
import * as ScreenOrientation from 'expo-screen-orientation'; // Screen orientation control
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Safe area handling

// Video stream data structure
interface VideoStream {
  id: string;
  title: string;
  description: string;
  uri: string;
  thumbnail?: string;
}

// Available video streams
const VIDEO_STREAMS: VideoStream[] = [
  {
    id: 'stream1',
    title: 'Test Stream 1',
    description: '',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    id: 'stream2',
    title: 'Test Stream 2',
    description: '',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'stream3',
    title: 'Test Stream 3',
    description: '',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    id: 'stream4',
    title: 'Test Stream 4',
    description: '',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
];

/**
 * VideoPlayerScreen Component
 * 
 * Main component for the video player tab that displays an HLS video stream
 * with comprehensive playback controls and fullscreen functionality.
 * 
 * @returns {JSX.Element} Video player screen with controls and fullscreen mode
 */
export default function VideoPlayerScreen() {
  // Video component reference for direct control
  const video = useRef<Video>(null);
  
  // Video playback state
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isPlaying, setIsPlaying] = useState(false);  // Play/pause state
  const [isMuted, setIsMuted] = useState(false);  // Mute state
  const [currentTime, setCurrentTime] = useState(0);  // Current playback time
  const [duration, setDuration] = useState(0);  // Total video duration
  
  // Global fullscreen state from context
  const { isFullscreen, setIsFullscreen } = useFullscreen();
  
  // UI state management
  const [isLoading, setIsLoading] = useState(false);  // Loading state for operations
  const [showControls, setShowControls] = useState(true);  // Controls visibility
  const [volume, setVolume] = useState(1.0);  // Volume level
  
  // Video stream management
  const [currentStream, setCurrentStream] = useState<VideoStream>(VIDEO_STREAMS[0]);  // Currently selected stream
  const [showStreamSelector, setShowStreamSelector] = useState(false);  // Stream selector visibility
  
  // Orientation management
  const [originalOrientation, setOriginalOrientation] = useState<ScreenOrientation.Orientation | null>(null);
  
  // Animation and layout
  const controlsOpacity = useRef(new Animated.Value(1)).current;  // Controls fade animation
  const insets = useSafeAreaInsets();  // Safe area for devices with notches
  const screenData = Dimensions.get('window');  // Screen dimensions

  useEffect(() => {
    // Listen for notification responses (bonus feature)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen === 'video') {
        // Notification was tapped, we're already on video page
        Alert.alert('Notification Tapped!', 'You opened the video player from a notification!');
      }
    });

    return () => subscription.remove();
  }, []);

  // Get original orientation on component mount
  useEffect(() => {
    const getOriginalOrientation = async () => {
      try {
        const orientation = await ScreenOrientation.getOrientationAsync();
        setOriginalOrientation(orientation);
      } catch (error) {
        console.log('Error getting orientation:', error);
      }
    };

    getOriginalOrientation();
  }, []);

  // Cleanup: restore original orientation when component unmounts
  useEffect(() => {
    return () => {
      if (isFullscreen && originalOrientation) {
        // Convert orientation to lock type
        const lockType = originalOrientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
                        originalOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
          ? ScreenOrientation.OrientationLock.PORTRAIT_UP
          : ScreenOrientation.OrientationLock.LANDSCAPE;
        ScreenOrientation.lockAsync(lockType).catch(console.log);
      }
    };
  }, [isFullscreen, originalOrientation]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        hideControls();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  const showControlsWithAnimation = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsWithAnimation();
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (video.current && status.isLoaded) {
        if (isPlaying) {
          await video.current.pauseAsync();
        } else {
          await video.current.playAsync();
        }
        setIsPlaying(!isPlaying);
        showControlsWithAnimation();
      }
    } catch (error) {
      console.log('Play/Pause error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMute = async () => {
    try {
      if (video.current && status.isLoaded) {
        await video.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.log('Mute error:', error);
    }
  };


  const handleSeekBarChange = async (value: number) => {
    try {
      if (video.current && status.isLoaded) {
        const newPosition = value * duration;
        await video.current.setPositionAsync(newPosition * 1000);
        setCurrentTime(newPosition);
      }
    } catch (error) {
      console.log('Seek bar error:', error);
    }
  };

  const handleSeek = async (seconds: number) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (video.current && status.isLoaded) {
        await video.current.setPositionAsync(seconds * 1000);
      }
    } catch (error) {
      console.log('Seek error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async (seconds: number) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (video.current && status.isLoaded) {
        const newPosition = Math.max(0, Math.min(duration, currentTime + seconds));
        await video.current.setPositionAsync(newPosition * 1000);
      }
    } catch (error) {
      console.log('Skip error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
    }
  };


  const handleVolume = async (vol: number) => {
    try {
      if (video.current && status.isLoaded) {
        await video.current.setVolumeAsync(vol);
        setVolume(vol);
        if (vol === 0) {
          setIsMuted(true);
        } else {
          setIsMuted(false);
        }
      }
    } catch (error) {
      console.log('Volume error:', error);
    }
  };

  const handleDoubleTap = () => {
    showControlsWithAnimation();
  };

  /**
   * Handle video stream selection
   * @param {VideoStream} stream - The selected video stream
   */
  const handleStreamSelection = async (stream: VideoStream) => {
    try {
      setIsLoading(true);
      
      // Pause current video if playing
      if (video.current && isPlaying) {
        await video.current.pauseAsync();
      }
      
      // Update current stream
      setCurrentStream(stream);
      
      // Reset video state
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      
      // Hide stream selector
      setShowStreamSelector(false);
      
      // Show controls briefly to indicate stream change
      showControlsWithAnimation();
      
    } catch (error) {
      console.log('Stream selection error:', error);
      Alert.alert('Error', 'Failed to switch video stream');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle stream selector visibility
   */
  const toggleStreamSelector = () => {
    setShowStreamSelector(!showStreamSelector);
  };



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Entering fullscreen - switch to landscape (allow both landscape orientations)
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
        showControlsWithAnimation();
      } else {
        // Exiting fullscreen - restore original orientation
        if (originalOrientation) {
          // Convert orientation to lock type
          const lockType = originalOrientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
                          originalOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
            ? ScreenOrientation.OrientationLock.PORTRAIT_UP
            : ScreenOrientation.OrientationLock.LANDSCAPE;
          await ScreenOrientation.lockAsync(lockType);
        } else {
          // Fallback to portrait if original orientation is not available
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen toggle error:', error);
      Alert.alert('Error', 'Failed to toggle fullscreen mode');
    }
  };



  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <TouchableOpacity 
          style={styles.fullscreenVideoContainer}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <Video
            ref={video}
            style={styles.fullscreenVideo}
            source={{
              uri: currentStream.uri,
            }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
          

          {/* Enhanced Controls Overlay */}
          {showControls && (
            <Animated.View style={[styles.fullscreenControls, { opacity: controlsOpacity }]}>
              {/* Top Controls */}
              <View style={styles.fullscreenTopControls}>
                <TouchableOpacity style={styles.fullscreenTopButton} onPress={toggleFullscreen}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.fullscreenTitleContainer}>
                  <Text style={styles.fullscreenTitle}>HLS Video Player</Text>
                </View>
                <TouchableOpacity style={styles.fullscreenTopButton} onPress={handleMute}>
                  <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Center Play Button */}
              <View style={styles.fullscreenCenterControls}>
                <TouchableOpacity style={styles.fullscreenCenterButton} onPress={() => handleSkip(-10)}>
                  <Ionicons name="play-skip-back" size={32} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.fullscreenPlayButton} onPress={handlePlayPause}>
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={40} 
                    color="black" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.fullscreenCenterButton} onPress={() => handleSkip(10)}>
                  <Ionicons name="play-skip-forward" size={32} color="white" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.fullscreenBottomControls}>
                {/* Seek Bar */}
                <View style={styles.seekBarContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.seekBar}
                    minimumValue={0}
                    maximumValue={1}
                    value={duration > 0 ? currentTime / duration : 0}
                    onValueChange={handleSeekBarChange}
                    minimumTrackTintColor="#8B5CF6"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="white"
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedText type="title" style={styles.title}>
        Video Player
      </ThemedText>
      
      {/* Current Stream Info */}
      <ThemedView style={styles.streamInfoContainer}>
        <ThemedText style={styles.streamTitle}>{currentStream.title}</ThemedText>
        {currentStream.description && (
          <ThemedText style={styles.streamDescription}>{currentStream.description}</ThemedText>
        )}
        <TouchableOpacity style={styles.streamSelectorButton} onPress={toggleStreamSelector}>
          <Ionicons name="list" size={20} color="white" />
          <Text style={styles.streamSelectorText}>Change Video</Text>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoWrapper}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <Video
            ref={video}
            style={styles.video}
            source={{
              uri: currentStream.uri,
            }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
          

          {/* Video Overlay Controls */}
          {showControls && (
            <Animated.View style={[styles.videoOverlay, { opacity: controlsOpacity }]}>
              <TouchableOpacity style={styles.videoPlayButton} onPress={handlePlayPause}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={50} 
                  color="white" 
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.controlsContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={1}
            value={duration > 0 ? currentTime / duration : 0}
            onValueChange={handleSeekBarChange}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="rgba(0,0,0,0.2)"
            thumbTintColor="#8B5CF6"
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControlsRow}>
          <TouchableOpacity style={styles.enhancedControlButton} onPress={() => handleSkip(-10)}>
            <Ionicons name="play-skip-back" size={20} color="white" />
            <Text style={styles.enhancedButtonText}>-10s</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.enhancedPlayButton} onPress={handlePlayPause}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.enhancedControlButton} onPress={() => handleSkip(10)}>
            <Ionicons name="play-skip-forward" size={20} color="white" />
            <Text style={styles.enhancedButtonText}>+10s</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControlsRow}>
          <TouchableOpacity style={styles.enhancedControlButton} onPress={handleMute}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={20} color="white" />
            <Text style={styles.enhancedButtonText}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.enhancedControlButton} onPress={toggleFullscreen}>
            <Ionicons name="expand" size={20} color="white" />
            <Text style={styles.enhancedButtonText}>Fullscreen</Text>
          </TouchableOpacity>
        </View>

      </ThemedView>

      {/* Stream Selector Modal */}
      {showStreamSelector && (
        <View style={styles.streamSelectorOverlay}>
          <View style={styles.streamSelectorModal}>
            <View style={styles.streamSelectorHeader}>
              <ThemedText style={styles.streamSelectorTitle}>Select Video Stream</ThemedText>
              <TouchableOpacity onPress={toggleStreamSelector}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.streamList}>
              {VIDEO_STREAMS.map((stream) => (
                <TouchableOpacity
                  key={stream.id}
                  style={[
                    styles.streamItem,
                    currentStream.id === stream.id && styles.streamItemActive
                  ]}
                  onPress={() => handleStreamSelection(stream)}
                >
                  <View style={styles.streamItemContent}>
                    <ThemedText style={styles.streamItemTitle}>{stream.title}</ThemedText>
                    {stream.description && (
                      <ThemedText style={styles.streamItemDescription}>{stream.description}</ThemedText>
                    )}
                  </View>
                  {currentStream.id === stream.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

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
    fontSize: 24,
    fontWeight: 'bold',
  },
  videoContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: 250,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 50,
    textAlign: 'center',
  },
  mainControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  enhancedControlButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  enhancedButtonText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  enhancedPlayButton: {
    backgroundColor: '#34C759',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Enhanced Fullscreen Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideoContainer: {
    flex: 1,
    position: 'relative',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  fullscreenTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fullscreenTopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fullscreenTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenCenterControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  fullscreenCenterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  fullscreenPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  fullscreenBottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  seekBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  seekBar: {
    flex: 1,
    height: 40,
    marginHorizontal: 15,
  },
  fullscreenControlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenControlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Stream Selector Styles
  streamInfoContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  streamDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  streamSelectorButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  streamSelectorText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  streamSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  streamSelectorModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  streamSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  streamSelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  streamList: {
    maxHeight: 400,
  },
  streamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  streamItemActive: {
    backgroundColor: '#F3F4F6',
  },
  streamItemContent: {
    flex: 1,
  },
  streamItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  streamItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
