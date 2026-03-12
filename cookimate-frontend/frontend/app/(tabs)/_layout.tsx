import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // This ensures the bar stays clean
        tabBarActiveTintColor: '#007AFF', 
      }}
    >
      {/* 1. HOME PAGE */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      {/* 2. MENU PLANNER */}
      <Tabs.Screen
        name="menuPlanerPage"
        options={{
          title: 'Planner',
        }}
      />

      {/* 3. TOOLS (The Grouped Folder) */}
      <Tabs.Screen
        name="(tools)"
        options={{
          title: 'Tools',
        }}
      />

      {/* 4. PROFILE PAGE */}
      <Tabs.Screen
        name="profilePage"
        options={{
          title: 'Profile',
        }}
      />

      {/* --- HIDE EVERYTHING ELSE FROM THE NAV BAR --- */}
      
      {/* Individual files remaining in (tabs) */}
      <Tabs.Screen name="myRecipes" options={{ href: null }} />
      <Tabs.Screen name="generateRecipes" options={{ href: null }} />

      {/* Folders remaining in (tabs) */}
      <Tabs.Screen name="Community" options={{ href: null }} />
      <Tabs.Screen name="CommunityPost" options={{ href: null }} />
      <Tabs.Screen name="details" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="recipe" options={{ href: null }} />
    </Tabs>
  );
}