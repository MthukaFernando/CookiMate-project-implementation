import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CommunityUserProfile() {
  // This matches your filename [CommunityUserid].jsx
  const { CommunityUserid } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profile</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Developing Profile for:</Text>
        <Text style={styles.idText}>{CommunityUserid}</Text>
      </View>

      <TouchableOpacity
        style={styles.profileLink}
        onPress={() => router.push('/Community/CommunityFeedCards')}
      >
        <Text style={styles.profileLinkText}>Go to Community Feed cards</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Light grey background
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#612D25', // Your theme brown
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  idText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  profileLink: {
    backgroundColor: '#612D25', // Matching your button color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  profileLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});