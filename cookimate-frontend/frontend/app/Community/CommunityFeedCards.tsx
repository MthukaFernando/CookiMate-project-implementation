import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet, 
  RefreshControl, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform 
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
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          <View style={styles.imageBox}>
            <Image source={{ uri: item.imageUrl }} style={styles.mainImg} />
            {isOverlayOpen && item.comments.length > 0 && (
              <View style={styles.commentOverlay}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>Comments</Text>
                  <TouchableOpacity onPress={() => setActiveCommentPostId(null)}>
                    <Ionicons name="close-circle" size={20} color="white" />
                  </TouchableOpacity>
                </View>
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

          <TouchableOpacity 
            style={styles.userRow} 
            onPress={() => router.push(`/Community/${item.user.firebaseUid}`)}
          >
            <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
            <Text style={styles.username}>{item.user?.username}</Text>
          </TouchableOpacity>

          <View style={styles.captionRow}>
            <Text style={styles.captionText}>
              <Text style={styles.boldUser}>{item.user?.username} </Text>
              {item.caption}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : "#333"} />
              <Text style={styles.count}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveCommentPostId(isOverlayOpen ? null : item._id)} 
              style={styles.iconBtn}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#333" />
              <Text style={styles.count}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={globalStyle.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* 1. HEADER (High Z-Index) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Search users..." 
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color="#ead2d2" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/Community/create')}>
            <Ionicons name="add-circle" size={42} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* 2. SEARCH RESULTS DROPDOWN (Inside Header Container to ensure it stays below bar) */}
        {isSearching && (
          <View style={styles.dropdown}>
            {searchResults.length > 0 ? (
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
                    <View style={styles.resultLeft}>
                      <Image source={{ uri: item.profilePic }} style={styles.resAvatar} />
                      <View>
                        <Text style={styles.resName}>@{item.username}</Text>
                        <Text style={styles.resSubText}>View Profile</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#DDD" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.noResult}>
                <Text style={styles.noResultText}>No users found</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 3. MAIN FEED */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
        onScrollBeginDrag={() => setIsSearching(false)}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100, // Keeps dropdown and bar above the feed
    backgroundColor: '#f2ece2',
    paddingBottom: 10,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
  },
  searchBar: { 
    flex: 0.75, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 15, 
    paddingHorizontal: 12, 
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  input: { flex: 1, fontSize: 15, color: '#333' },
  addBtn: { flex: 0.25, alignItems: 'center' },
  
  dropdown: { 
    position: 'absolute', 
    top: 55, // Starts exactly below the search bar
    left: 15, 
    right: 15, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    elevation: 10, 
    maxHeight: 300,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  resultItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 10, 
    paddingHorizontal: 15
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center' },
  resAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B'
  },
  resName: { fontWeight: '700', fontSize: 15, color: '#333' },
  resSubText: { fontSize: 12, color: '#999', marginTop: 2 },
  noResult: { padding: 20, alignItems: 'center' },
  noResultText: { color: '#999', fontStyle: 'italic' },

  centerContainer: { width: '100%', alignItems: 'center', marginTop: 10 },
  card: { 
    width: width * 0.85, 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 15, 
    marginBottom: 20, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  dateRow: { alignItems: 'flex-end', marginBottom: 8 },
  dateText: { fontSize: 10, color: '#BBB', fontWeight: 'bold' },
  imageBox: { width: '100%', height: 300, borderRadius: 20, overflow: 'hidden' },
  mainImg: { width: '100%', height: '100%' },
  commentOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 20 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#444', paddingBottom: 5 },
  overlayTitle: { color: 'white', fontWeight: 'bold' },
  commentLine: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  cUser: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 13 },
  cText: { color: 'white', fontSize: 13 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  captionRow: { marginTop: 10 },
  captionText: { fontSize: 14, color: '#444' },
  boldUser: { fontWeight: 'bold', color: '#000' },
  actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  count: { marginLeft: 6, fontWeight: '700', color: '#666' }
});