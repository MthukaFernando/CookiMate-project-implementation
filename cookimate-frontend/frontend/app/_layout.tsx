import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User, signOut } from 'firebase/auth'; 
import { auth } from '../config/firebase'; // Ensure this path correctly points to your firebase config
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  // State to track the Firebase user and the initial loading phase
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Setup the Firebase Auth Observer
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });
    
    
    return subscriber; 
  }, [initializing]);

  
  useEffect(() => {
    // Wait until Firebase finished checking the initial auth state
    if (initializing) return;

    // Check if the user is currently inside the (auth) folder (login/signup)
    const inAuthGroup = segments[0] === '(auth)';

    // Logical check for verification
    const isVerified = user?.emailVerified;

    if (!user && !inAuthGroup) {
      // CASE: Not logged in and trying to access home -> Redirect to Login
      router.replace('/loginPage');
    } 
    else if (user && !isVerified && !inAuthGroup) {
      // CASE: Logged in but NOT verified -> Prevent entry
      // We sign them out immediately so the 'user' state resets to null
      signOut(auth);
      router.replace('/loginPage');
    }
    else if (user && isVerified && inAuthGroup) {
      // CASE: Logged in AND verified -> Redirect to Home
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments]);

  // 3. Show Loading Spinner while the 'Token' is being validated by Firebase
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#5f4436" />
      </View>
    );
  }

  // 4. Main Navigation Stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* These match your (auth) and (tabs) folder names */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}