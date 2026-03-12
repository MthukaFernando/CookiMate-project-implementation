import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width * 0.9;
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

// 1. Defined a specific list of tabs we want to show
const VALID_TABS = ["index", "menuPlanerPage", "tools", "profilePage"];

function MyTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;

  // 2. This effect moves the circle whenever the active tab index changes
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      bounciness: 5,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.container, { bottom: 2 }]}>
      <View style={styles.pill}>
        {/* The Sliding Purple Circle */}
        <Animated.View 
          style={[
            styles.activeIndicator, 
            { transform: [{ translateX }] }
          ]} 
        />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Only render the 4 tabs you want
          if (!VALID_TABS.includes(route.name)) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icons: any = {
            index: isFocused ? 'home' : 'home-outline',
            menuPlanerPage: isFocused ? 'restaurant' : 'restaurant-outline',
            tools: isFocused ? 'construct' : 'construct-outline',
            profilePage: isFocused ? 'person' : 'person-outline',
          };

          const labels: any = {
            index: 'Home',
            menuPlanerPage: 'Planner',
            tools: 'Tools',
            profilePage: 'Profile',
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={icons[route.name]} 
                size={24} 
                color={isFocused ? '#FFFFFF' : '#8E8E93'} 
              />
              {/* Labels appear only when NOT focused to keep it clean like your image */}
              {!isFocused && <Text style={styles.label}>{labels[route.name]}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="menuPlanerPage" />
        <Tabs.Screen name="tools" />
        <Tabs.Screen name="profilePage" />
        
        {/* Hiding extras from the logic */}
        <Tabs.Screen name="myRecipes" options={{ href: null }} />
        <Tabs.Screen name="generateRecipes" options={{ href: null }} />
        <Tabs.Screen name="Community" options={{ href: null }} />
        <Tabs.Screen name="CommunityPost" options={{ href: null }} />
        <Tabs.Screen name="details" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="recipe" options={{ href: null }} />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: TAB_BAR_WIDTH,
  },
  pill: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#373636',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  activeIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#fbab32ea', // Purple
    borderRadius: 25,
    left: (TAB_WIDTH - 50) / 2, 
  },
  tabItem: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: '#8E8E93',
    fontWeight: '500'
  },
});