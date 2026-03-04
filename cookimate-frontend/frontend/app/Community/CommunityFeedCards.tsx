import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axios from 'axios';
import { auth } from "../../config/firebase"; // Ensure this path matches your project

// --- 1. TYPES & INTERFACES ---
interface User {
  firebaseUid: string;
  username: string;
  profilePic: string;
}

interface PostItem {
  _id: string;
  user: User;
  imageUrl: string;
  caption: string;
  likes: string[]; // Array of Firebase UID strings
  comments: any[];
  createdAt: string;
}

// --- 2. DYNAMIC API CONFIGURATION ---
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
// Base URL for general social actions (like, comment)
const BASE_API = `http://${address}:5000/api/social`;
// Specific URL for the feed
const FEED_API = `${BASE_API}/feed`;

export default function CommunityFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentUser = auth.currentUser;

  // --- 3. DATA FETCHING ---
  const fetchFeed = async () => {
    try {
      console.log("Fetching feed from:", FEED_API);
      const response = await axios.get(FEED_API);
      setPosts(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  // --- 4. LIKE LOGIC ---
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      Alert.alert("Hold on!", "You need to be logged in to like posts.");
      return;
    }

    try {
      // Backend expects: PUT /api/social/:postId/like
      await axios.put(`${BASE_API}/${postId}/like`, {
        userId: currentUser.uid 
      });
      
      // OPTIMISTIC UI: Update local state immediately so it feels fast
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(currentUser.uid);
            const newLikes = isLiked 
              ? post.likes.filter(id => id !== currentUser.uid) 
              : [...post.likes, currentUser.uid];
            return { ...post, likes: newLikes };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Like error:", error);
      Alert.alert("Error", "Could not update like. Please try again.");
    }
  };

  // --- 5. RENDER POST COMPONENT ---
  const renderPost = ({ item }: { item: PostItem }) => {
    const isLiked = item.likes?.includes(currentUser?.uid || "");

    return (
      <View style={styles.card}>
        {/* Header: Profile Link */}
        <TouchableOpacity 
          style={styles.header} 
          onPress={() => router.push(`/Community/${item.user?.firebaseUid}`)}
        >
          <Image 
            source={{ uri: item.user?.profilePic || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.username}>{item.user?.username || "Unknown Cook"}</Text>
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Content Image */}
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />

        {/* Action Row: Likes & Comments */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.iconGroup} 
            onPress={() => handleLike(item._id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#FF3B30" : "#333"} 
            />
            <Text style={styles.countText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconGroup}
            onPress={() => router.push(`/Community/comments/${item._id}`)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#333" />
            <Text style={styles.countText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>
            <Text style={styles.boldUsername}>{item.user?.username}</Text> {item.caption}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: '#888' }}>No posts found in the feed.</Text>
          </View>
        }
      />
    </View>
  );
}

// --- 6. STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFF', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#EEE' },
  username: { fontWeight: '700', fontSize: 15, color: '#262626' },
  timeText: { fontSize: 11, color: '#999', marginTop: 1 },
  postImage: { width: '100%', aspectRatio: 1, backgroundColor: '#F0F0F0' },
  actionRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10 },
  iconGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  countText: { marginLeft: 6, fontWeight: '600', color: '#444' },
  captionContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  captionText: { fontSize: 14, color: '#333', lineHeight: 20 },
  boldUsername: { fontWeight: '700' },
});