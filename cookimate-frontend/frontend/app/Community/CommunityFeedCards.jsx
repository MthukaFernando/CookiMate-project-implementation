
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const CommunityFeedCards = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
     
        <TouchableOpacity
        style={styles.profileLink}
        onPress={() => router.push('/Community/DevUser')}
      >
        <Text style={styles.profileLinkText}>Go to Community User</Text>
      </TouchableOpacity>

      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 50, // Added margin to avoid notch/status bar overlap
    backgroundColor: '#f5f5f5',
  },
  profileLink: {
    padding: 10,
    backgroundColor: '#612D25',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  profileLinkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
  },
});

export default CommunityFeedCards;