import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      {/* This points to your app/index.tsx */}
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      
      {/* These match your page filenames exactly */}
      <Stack.Screen name="loginPage" options={{ title: 'Login'  }} />
      <Stack.Screen name="signupPage" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="menuPlanerPage" options={{ title: 'Menu Planner' }} />
      
      {/* This points to app/tools/index.tsx */}
      <Stack.Screen name="tools/index" options={{ title: 'Tools' }} />
    </Stack>
  );
}