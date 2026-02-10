import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

// We import the content from our other files (we will code these in the next step)
import TimerPage from './timerPage';
import ConverterPage from './converterPage';

export default function ToolsMain() {
  // This state keeps track of which tool to show. Default is 'timer'.
  const [activeTab, setActiveTab] = useState<'timer' | 'converter'>('timer');

  return (
    <View style={styles.container}>
      {/* 1. The Toggle Button at the Top */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.button, activeTab === 'timer' && styles.activeButton]} 
          onPress={() => setActiveTab('timer')}
        >
          <Text style={activeTab === 'timer' ? styles.activeText : styles.inactiveText}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, activeTab === 'converter' && styles.activeButton]} 
          onPress={() => setActiveTab('converter')}
        >
          <Text style={activeTab === 'converter' ? styles.activeText : styles.inactiveText}>Converter</Text>
        </TouchableOpacity>
      </View>

      {/* 2. The Dynamic Content Area */}
      <View style={styles.content}>
        {activeTab === 'timer' ? <TimerPage /> : <ConverterPage />}
      </View>

      {/* 3. Global Back to Home Link */}
      <Link href="/" style={styles.homeLink}>
        Back to Home Page
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#F2ECE2',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#F2ECE2',
    borderRadius: 20
  },
  activeButton: {
    backgroundColor: "#E0C2A0",
  },
  activeText: {
    color: 'black',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: 'black',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  homeLink: {
    marginBottom: 40,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});