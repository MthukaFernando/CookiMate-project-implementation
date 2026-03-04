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
import { globalStyle } from '../globalStyleSheet.style';

// --- TYPES ---
interface User {
  _id: string;
  firebaseUid: string;
  username: string;
  profilePic: string;
}

interface PostItem {
  _id: string;
  user: User;
  imageUrl: string;
  caption: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

const { width } = Dimensions.get('window');
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

export default function CommunityFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  // --- FETCH FEED ---
  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/social/feed`);
      setPosts(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- SEARCH LOGIC ---
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      setIsSearching(true);
      try {
        const res = await axios.get(`${BASE_URL}/users/search`, {
          params: { username: text }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.log("Search error:", err);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  // --- RENDER POST CARD ---
  const renderPost = ({ item }: { item: PostItem }) => {
    const isLiked = item.likes?.includes(currentUser?.uid || "");
    const isOverlayOpen = activeCommentPostId === item._id;

    return (
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          {/* 1. Date */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          {/* 2. Image + Comments Overlay */}
          <View style={styles.imageBox}>
            <Image source={{ uri: item.imageUrl }} style={styles.mainImg} />
            {isOverlayOpen && item.comments.length > 0 && (
              <View style={styles.commentOverlay}>
                <ScrollView nestedScrollEnabled>
                  {item.comments.map((c, i) => (
                    <View key={i} style={styles.commentLine}>
                      <Text style={styles.cUser}>{c.user?.username || 'User'}: </Text>
                      <Text style={styles.cText}>{c.text}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 3. User Info Row */}
          <TouchableOpacity 
            style={styles.userRow} 
            onPress={() => router.push(`/Community/${item.user.firebaseUid}`)}
          >
            <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
            <Text style={styles.username}>{item.user?.username}</Text>
          </TouchableOpacity>

          {/* 4. Caption */}
          <View style={styles.captionRow}>
            <Text style={styles.captionText}>
              <Text style={styles.boldUser}>{item.user?.username} </Text>
              {item.caption}
            </Text>
          </View>

          {/* 5. Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "red" : "#333"} />
              <Text style={styles.count}>{item.likes?.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveCommentPostId(isOverlayOpen ? null : item._id)} 
              style={styles.iconBtn}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#333" />
              <Text style={styles.count}>{item.comments?.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={globalStyle.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* HEADER: SEARCH (75%) + ADD (25%) */}
      <View style={styles.headerRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.input} 
            placeholder="Search users..." 
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/Community/create')}>
          <Ionicons name="add-circle" size={38} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* SEARCH RESULTS OVERLAY */}
      {isSearching && searchResults.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList 
            data={searchResults}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem}
                onPress={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                  router.push(`/Community/${item.firebaseUid}`);
                }}
              >
                <Image source={{ uri: item.profilePic }} style={styles.resAvatar} />
                <Text style={styles.resName}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* MAIN FEED */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
        onScrollBeginDrag={() => setIsSearching(false)}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white', zIndex: 10 },
  searchBar: { flex: 0.75, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  input: { flex: 1, fontSize: 14 },
  addBtn: { flex: 0.25, alignItems: 'center' },
  
  dropdown: { position: 'absolute', top: 70, left: 15, right: 15, backgroundColor: 'white', borderRadius: 12, elevation: 5, zIndex: 100, maxHeight: 200 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  resAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  resName: { fontWeight: 'bold' },

  centerContainer: { width: '100%', alignItems: 'center', marginTop: 15 },
  card: { width: width * 0.8, backgroundColor: 'white', borderRadius: 20, padding: 15, elevation: 3, shadowOpacity: 0.1 },
  dateRow: { alignItems: 'flex-end', marginBottom: 5 },
  dateText: { fontSize: 10, color: '#BBB' },
  imageBox: { width: '100%', height: 280, borderRadius: 15, overflow: 'hidden' },
  mainImg: { width: '100%', height: '100%' },
  commentOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10 },
  commentLine: { flexDirection: 'row', marginBottom: 5 },
  cUser: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 12 },
  cText: { color: 'white', fontSize: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 15 },
  captionRow: { marginTop: 8 },
  captionText: { fontSize: 13, color: '#444' },
  boldUser: { fontWeight: 'bold', color: '#000' },
  actionRow: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  count: { marginLeft: 5, fontWeight: 'bold' }
});