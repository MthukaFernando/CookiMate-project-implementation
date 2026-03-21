import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Link } from 'expo-router';

// Importing your updated pages
import TimerPage from '../details/timerPage';
import ConverterPage from '../details/converterPage';
import GlobalChatbot from "../GlobalChatbot"; // 1. Added Import

// --- DARK BRANDING COLORS ---
const BRAND = {
  bg: "#0A0A0A",        // Deep Midnight
  surface: "#1E1E1E",   // Elevated Grey
  accent: "#D4AF37",    // Vibrant Amber/Gold
  textMain: "#FFFFFF",
  textMuted: "#A0A0A0",
  border: "#333333",
};

export default function ToolsMain() {
  // State to track which tool to show
  const [activeTab, setActiveTab] = useState<'timer' | 'converter'>('timer');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. Styled Segmented Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.button, activeTab === 'timer' && styles.activeButton]} 
          onPress={() => setActiveTab('timer')}
        >
          <Text style={[
            styles.buttonText, 
            activeTab === 'timer' ? styles.activeText : styles.inactiveText
          ]}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.button, activeTab === 'converter' && styles.activeButton]} 
          onPress={() => setActiveTab('converter')}
        >
          <Text style={[
            styles.buttonText, 
            activeTab === 'converter' ? styles.activeText : styles.inactiveText
          ]}>Converter</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Content Area */}
      <View style={styles.content}>
        {activeTab === 'timer' ? <TimerPage /> : <ConverterPage />}
      </View>

      {/* 2. Added GlobalChatbot here */}
      <GlobalChatbot />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.bg,
    // This adds extra padding on Android to clear the status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: BRAND.surface,
    borderRadius: 25,
    marginHorizontal: 40,
    marginTop: 15, // Space between top of screen/safe area and the toggle
    marginBottom: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: BRAND.accent,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeText: {
    color: BRAND.bg, 
  },
  inactiveText: {
    color: BRAND.textMuted,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  homeLink: {
    color: BRAND.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
});