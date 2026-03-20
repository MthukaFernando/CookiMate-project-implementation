import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User, signOut } from 'firebase/auth'; 
import { auth } from '../config/firebase'; 
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// 1. Keep the splash screen visible while we check Firebase
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();

  // 2. Setup Firebase Auth Observer
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });
    return subscriber; 
  }, [initializing]);

  // 3. Navigation and Splash Screen logic
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isVerified = user?.emailVerified;

    // --- Start Splash Screen Logic ---
    const hideSplash = async () => {
       // Optional: Add a small delay so they see your cat icon clearly
       await new Promise(resolve => setTimeout(resolve, 500)); 
       await SplashScreen.hideAsync();
    };
    hideSplash();
    // --- End Splash Screen Logic ---

    if (!user && !inAuthGroup) {
      router.replace('/loginPage');
    } 
    else if (user && !isVerified && !inAuthGroup) {
      signOut(auth);
      router.replace('/loginPage');
    }
    else if (user && isVerified && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments]);

  // 4. While Firebase is working, we show a background that matches the splash
  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#E6F4FE' }} />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}