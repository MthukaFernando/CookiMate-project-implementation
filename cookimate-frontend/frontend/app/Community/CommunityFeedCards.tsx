import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, Alert, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axios from 'axios';
import { auth } from "../../config/firebase";

// --- TYPES ---
interface User {
  firebaseUid: string;
  username: string;
  profilePic: string;
}

interface Comment {
  _id: string;
  user: User | string; 
  text: string;
}

interface PostItem {
  _id: string; // MongoDB ID
  user: User;  // Populated Author
  imageUrl: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

const { width } = Dimensions.get('window');
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_API = `http://${address}:5000/api/social`;

export default function CommunityFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const currentUser = auth.currentUser;

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${BASE_API}/feed`);
      setPosts(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  // --- LIKE HANDLER ---
  const handleLike = async (postId: string) => {
    if (!currentUser) return Alert.alert("Join us!", "Login to like posts.");
    try {
      await axios.put(`${BASE_API}/${postId}/like`, { userId: currentUser.uid });
      fetchFeed(); // Refresh to update points and counts
    } catch (error) { console.error(error); }
  };

  // --- COMMENT HANDLER ---
  const handleAddComment = async (postId: string) => {
    if (!currentUser) return Alert.alert("Login", "Login to comment.");
    if (!commentText.trim()) return;

    try {
      // We pass the MongoDB postId in the URL and current user UID in body
      const res = await axios.post(`${BASE_API}/${postId}/comment`, {
        userId: currentUser.uid,
        text: commentText
      });

      if (res.status === 200) {
        setCommentText(''); // CLEAR INPUT
        fetchFeed(); // Refresh to see the comment in overlay
      }
    } catch (error: any) { 
      console.error("Comment Error:", error.response?.data || error.message);
      Alert.alert("Error", "Could not post comment. Check backend.");
    }
  };

  const renderPost = ({ item }: { item: PostItem }) => {
    const isLiked = item.likes?.includes(currentUser?.uid || "");
    const isCommentOverlayOpen = activeCommentPostId === item._id;

    return (
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          
          {/* 1. TOP: Date */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* 2. MIDDLE: Image + Scrollable Comment Overlay */}
          <View style={styles.imageBox}>
            <Image source={{ uri: item.imageUrl }} style={styles.mainImg} />
            
            {isCommentOverlayOpen && item.comments.length > 0 && (
              <View style={styles.commentOverlay}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>Comments</Text>
                  <TouchableOpacity onPress={() => setActiveCommentPostId(null)}>
                    <Ionicons name="close-circle" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                  {item.comments.map((c, index) => (
                    <View key={index} style={styles.commentLine}>
                      <Text style={styles.cUser}>{(c.user as User)?.username || 'User'}: </Text>
                      <Text style={styles.cText}>{c.text}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 3. USER ROW: DP + Name (Clickable) */}
          <TouchableOpacity 
            style={styles.userRow} 
            onPress={() => router.push(`/Community/${item.user.firebaseUid}`)}
          >
            <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
            <Text style={styles.username}>{item.user?.username}</Text>
          </TouchableOpacity>

          {/* 4. ACTIONS: Like & Comment */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleLike(item._id)} style={styles.iconBtn}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : "#333"} />
              <Text style={styles.count}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
               onPress={() => setActiveCommentPostId(isCommentOverlayOpen ? null : item._id)} 
               style={styles.iconBtn}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#333" />
              <Text style={styles.count}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>

          {/* 5. INPUT BOX */}
          {isCommentOverlayOpen && (
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.input} 
                placeholder="Type your comment..." 
                value={commentText}
                onChangeText={setCommentText}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => handleAddComment(item._id)}>
                <Ionicons name="send" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { width: '100%', alignItems: 'center' },
  card: { 
    width: width * 0.8, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 12, 
    marginBottom: 25, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  dateRow: { width: '100%', alignItems: 'flex-end', marginBottom: 5 },
  dateText: { fontSize: 10, color: '#BBB', fontWeight: 'bold' },
  imageBox: { width: '100%', height: 280, borderRadius: 15, overflow: 'hidden', backgroundColor: '#EEE', position: 'relative' },
  mainImg: { width: '100%', height: '100%' },
  commentOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  overlayTitle: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  commentLine: { flexDirection: 'row', marginBottom: 6, flexWrap: 'wrap' },
  cUser: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 12 },
  cText: { color: 'white', fontSize: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10, backgroundColor: '#DDD' },
  username: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  count: { marginLeft: 6, fontWeight: '700', color: '#555' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#F5F5F5', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 5 },
  input: { flex: 1, height: 40, fontSize: 13, color: '#333' }
});