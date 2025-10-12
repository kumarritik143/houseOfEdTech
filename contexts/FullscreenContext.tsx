

import React, { createContext, ReactNode, useContext, useState } from 'react';

// TypeScript interface defining the shape of our context
interface FullscreenContextType {
  isFullscreen: boolean;           // Current fullscreen state (true/false)
  setIsFullscreen: (value: boolean) => void;  // Function to update fullscreen state
}

// Create the React Context with undefined as default (will be set by provider)
const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

/**
 * Custom hook to access fullscreen context
 * This hook provides type safety and error handling
 * @returns {FullscreenContextType} The fullscreen context with state and setter
 * @throws {Error} If used outside of FullscreenProvider
 */
export const useFullscreen = () => {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};

// Props interface for the provider component
interface FullscreenProviderProps {
  children: ReactNode;  // Child components that will have access to context
}

/**
 * FullscreenProvider Component
 * 
 * This component wraps the entire app and provides fullscreen state to all child components.
 * It manages the fullscreen state using React's useState hook.
 * 
 * @param {FullscreenProviderProps} props - Component props
 * @returns {JSX.Element} Provider component with context value
 */
export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({ children }) => {
  // Local state to track fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};
