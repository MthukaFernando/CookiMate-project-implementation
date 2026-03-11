import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet, 
  RefreshControl, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axios from 'axios';
import { auth } from "../../config/firebase";
import { globalStyle } from '../globalStyleSheet.style';

const { width } = Dimensions.get('window');
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

export default function CommunityFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = auth.currentUser;

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/social/feed`);
      setPosts(response.data);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setRefreshing(false); 
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      setIsSearching(true);
      try {
        const res = await axios.get(`${BASE_URL}/users/search`, { params: { username: text } });
        setSearchResults(res.data);
      } catch (err) { console.log(err); }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const hasLiked = p.likes?.includes(currentUser.uid);
        const newLikes = hasLiked 
          ? p.likes.filter((id: string) => id !== currentUser.uid) 
          : [...(p.likes || []), currentUser.uid];
        return { ...p, likes: newLikes };
      }
      return p;
    }));
    try {
      await axios.put(`${BASE_URL}/social/${postId}/like`, { userId: currentUser.uid });
    } catch (err) { 
      console.error("Like failed", err);
      fetchFeed(); 
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/social/${postId}/comment`, {
        userId: currentUser.uid,
        text: commentText
      });
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      setCommentText('');
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  const renderPost = ({ item }: { item: any }) => {
    const isLiked = item.likes?.includes(currentUser?.uid);
    const isInteracting = activeCommentPostId === item._id;

    return (
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <View style={styles.headerArea}>
            <TouchableOpacity style={styles.userRow} onPress={() => router.push(`/Community/${item.user?.firebaseUid}`)}>
               <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
               <View>
                 <Text style={styles.username}>{item.user?.username}</Text>
                 <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </Text>
               </View>
            </TouchableOpacity>
          </View>

          <View style={styles.imageBox}>
            <Image source={{ uri: item.imageUrl }} style={styles.mainImg} resizeMode="cover" />
            {isInteracting && (
              <View style={styles.commentOverlay}>
                <View style={styles.overlayHeader}>
                    <Text style={styles.overlayTitle}>Recent Comments</Text>
                    <TouchableOpacity onPress={() => setActiveCommentPostId(null)}>
                        <Ionicons name="chevron-down" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
                <ScrollView nestedScrollEnabled style={styles.overlayScroll} showsVerticalScrollIndicator={true}>
                  {item.comments?.length > 0 ? (
                    item.comments.map((c: any, i: number) => (
                      <View key={i} style={styles.commentLine}>
                        <Text style={styles.cUser}>{c.user?.username}  </Text>
                        <Text style={styles.cText}>{c.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>Be the first to comment!</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.captionRow}>
             <Text style={styles.captionText}>
                <Text style={styles.boldUser}>{item.user?.username} </Text>
                {item.caption}
             </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleLike(item._id)}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : "#333"} />
              <Text style={styles.count}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconBtn} onPress={() => {
                setActiveCommentPostId(isInteracting ? null : item._id);
                setCommentText('');
            }}>
              <Ionicons name={isInteracting ? "chatbubble" : "chatbubble-outline"} size={24} color="#333" />
              <Text style={styles.count}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>

          {isInteracting && (
            <View style={styles.bottomInputContainer}>
              <TextInput 
                style={styles.bottomInput}
                placeholder="Write a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                autoFocus
              />
              <TouchableOpacity onPress={() => handleCommentSubmit(item._id)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FF6B6B" />
                ) : (
                  <Ionicons name="send" size={22} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyle.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.searchHeaderContainer}>
        <View style={styles.headerRow}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Search users..." 
              value={searchQuery} 
              onChangeText={handleSearch} 
            />
          </View>
          
          <TouchableOpacity onPress={() => router.push('/CommunityPost')}>
            <Ionicons name="add-circle" size={42} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View style={styles.dropdown}>
            {searchResults.map((u) => (
              <TouchableOpacity 
                key={u._id} 
                style={styles.resultItem} 
                onPress={() => { setIsSearching(false); setSearchQuery(''); router.push(`/Community/${u.firebaseUid}`); }}
              >
                <Image source={{ uri: u.profilePic }} style={styles.resAvatar} />
                <Text style={styles.resName}>@{u.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList 
        data={posts} 
        renderItem={renderPost} 
        keyExtractor={p => p._id} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} />}
        onScrollBeginDrag={() => setIsSearching(false)}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2ece2' },
  loadingText: { marginTop: 10, color: '#666', fontWeight: '600' },

  searchHeaderContainer: { zIndex: 100, backgroundColor: '#f2ece2', padding: 10, paddingBottom: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  
  // Back button style
  backBtn: { marginRight: 10, padding: 5 },

  searchBar: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 15, 
    paddingHorizontal: 12, 
    marginRight: 10, 
    height: 45, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 2 
  },
  input: { flex: 1 },
  dropdown: { position: 'absolute', top: 65, left: 10, right: 10, backgroundColor: 'white', borderRadius: 15, elevation: 5, padding: 10, zIndex: 1000 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  resAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  resName: { fontWeight: '600' },

  centerContainer: { alignItems: 'center', marginTop: 30 },
  card: { width: width * 0.92, backgroundColor: 'white', borderRadius: 25, padding: 15, elevation: 3 },
  headerArea: { marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 12 },
  username: { fontWeight: 'bold', fontSize: 15 },
  dateText: { fontSize: 10, color: '#AAA' },

  imageBox: { width: '100%', height: 400, borderRadius: 20, overflow: 'hidden', backgroundColor: '#eee' },
  mainImg: { width: '100%', height: '100%' },
  
  commentOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '75%', 
    backgroundColor: 'rgba(59, 50, 50, 0.85)', 
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#555', paddingBottom: 5 },
  overlayTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  overlayScroll: { flex: 1 },
  commentLine: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  cUser: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 13 },
  cText: { color: '#ede5d7', fontSize: 16, lineHeight: 20 },
  noCommentsText: { color: '#AAA', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },

  captionRow: { marginTop: 15 },
  captionText: { fontSize: 14, color: '#444' },
  boldUser: { fontWeight: 'bold', color: '#000' },

  actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  count: { marginLeft: 6, fontWeight: '700', color: '#666' },

  bottomInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F7F7F7', 
    borderRadius: 15, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  bottomInput: { flex: 1, fontSize: 14, color: '#333', height: 40 }
});