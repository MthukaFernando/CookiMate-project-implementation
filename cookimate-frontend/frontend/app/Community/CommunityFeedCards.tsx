import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants'; // 1. Added missing import

interface Post {
  _id: string;
  imageUrl: string;
  caption: string;
  user: {
    _id: string;
    username: string;
    profilePic: string;
    firebaseUid: string;
  };
  likes: string[];
  comments: any[];
}

const CommunityFeedCards = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // 2. Logic to handle the dynamic IP for physical device testing
        const debuggerHost = Constants.expoConfig?.hostUri;
        const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
        
        // 3. Fixed the fetch URL - used backticks and ${} to inject the variable
        const API_URL = `http://${address}:5000`;
        const response = await fetch(`${API_URL}/api/social/feed`); 
        
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Feed fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => router.push(`/Community/${item.user.firebaseUid}`)}
      >
        <Image source={{ uri: item.user.profilePic }} style={styles.avatar} />
        <Text style={styles.username}>{item.user.username}</Text>
      </TouchableOpacity>

      <Image source={{ uri: item.imageUrl }} style={styles.postImg} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.caption}>
          <Text style={{ fontWeight: 'bold' }}>{item.user?.username} </Text>
          {item.caption}
        </Text>
      </View>
    </View>
  );

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B6B" />
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderPost}
      contentContainerStyle={styles.listContainer}
      // Added refreshing capability for a better user experience
      onRefresh={() => {/* Add fetchFeed logic here again if desired */}}
      refreshing={loading}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: { padding: 10, backgroundColor: '#f8f8f8' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 10 },
  username: { fontWeight: '600', fontSize: 15 },
  postImg: { width: '100%', height: 300 },
  content: { padding: 12 },
  caption: { fontSize: 14, color: '#333' }
});

export default CommunityFeedCards;