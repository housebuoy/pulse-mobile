import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import your components
import { ScreenContent } from './components/ScreenContent';
import SplashScreen from './screens/splash-screen';

import './global.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a 3-second backend loading process (cold boot)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    // Cleanup the timer
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      {isLoading ? (
        // Show the beautiful blue gradient while "loading"
        <SplashScreen />
      ) : (
        // Once loaded, show the main app (We will build the Login here next!)
        <ScreenContent title="Login Screen Coming Soon" path="App.tsx" />
      )}
      
      {/* 'light' makes the battery/time text white so it's readable on your blue gradient */}
      <StatusBar style={isLoading ? "light" : "auto"} />
    </SafeAreaProvider>
  );
}