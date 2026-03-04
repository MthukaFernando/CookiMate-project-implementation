import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

// 1. Dynamic IP setup (so it works on your physical phone)
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000/api/social/feed`;

export default function SimpleFeedTester() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Fetching from:", API_URL);
        const response = await axios.get(API_URL);
        setPosts(response.data);
      } catch (err) {
        console.error("Connection error. Is server running?", err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Test: {address}</Text>
      
      <FlatList
        data={posts}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* User Info from Populated Field */}
            <View style={styles.userRow}>
              <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
              <Text style={styles.username}>{item.user?.username || 'Unknown'}</Text>
            </View>

            {/* Post Content */}
            <Image source={{ uri: item.imageUrl }} style={styles.mainImage} />
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center' },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 10, elevation: 3 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10, backgroundColor: '#eee' },
  username: { fontWeight: 'bold' },
  mainImage: { width: '100%', height: 250, borderRadius: 5 },
  caption: { marginTop: 10, color: '#444' }
});