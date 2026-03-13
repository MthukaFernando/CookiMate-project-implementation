import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet, 
  RefreshControl, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, 
  Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Added for cross-platform safe areas
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axios from 'axios';
import { auth } from "../../config/firebase";
import { globalStyle } from '../globalStyleSheet.style';

const { width } = Dimensions.get('window');

const BASE_URL = `https://cookimate-project-implementation.onrender.com`;

// Theme matching your home page palette
const theme = {
  bg: "#0A0A0A",
  card: "#1E1E1E",
  gold: "#D4AF37",
  accent: "#FFD54F",
  text: "#FFFFFF",
  muted: "#AAAAAA",
  border: "#333333"
};

export default function CommunityFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Hook to get status bar/notch height
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
      const response = await axios.get(`${BASE_URL}/api/social/feed`);
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
        const res = await axios.get(`${BASE_URL}/api/users/search`, { params: { username: text } });
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
      await axios.put(`${BASE_URL}/api/social/${postId}/like`, { userId: currentUser.uid });
    } catch (err) { 
      console.error("Like failed", err);
      fetchFeed(); 
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/social/${postId}/comment`, {
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
        <ActivityIndicator size="large" color={theme.gold} />
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
                        <Ionicons name="chevron-down" size={22} color={theme.gold} />
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
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : theme.text} />
              <Text style={styles.count}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconBtn} onPress={() => {
                setActiveCommentPostId(isInteracting ? null : item._id);
                setCommentText('');
            }}>
              <Ionicons name={isInteracting ? "chatbubble" : "chatbubble-outline"} size={24} color={theme.text} />
              <Text style={styles.count}>{item.comments?.length || 0}</Text>
            </TouchableOpacity>
          </View>

          {isInteracting && (
            <View style={styles.bottomInputContainer}>
              <TextInput 
                style={styles.bottomInput}
                placeholder="Write a comment..."
                placeholderTextColor="#666"
                value={commentText}
                onChangeText={setCommentText}
                autoFocus
              />
              <TouchableOpacity onPress={() => handleCommentSubmit(item._id)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.gold} />
                ) : (
                  <Ionicons name="send" size={22} color={theme.gold} />
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
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar barStyle="light-content" />
      {/* Container now uses dynamic padding top for all phones */}
      <View style={[styles.searchHeaderContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backBtnAction} 
            onPress={() => router.push('/')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color={theme.gold} />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.muted} style={{ marginRight: 8 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Search users..." 
              placeholderTextColor={theme.muted}
              value={searchQuery} 
              onChangeText={handleSearch} 
            />
          </View>
          
          <TouchableOpacity onPress={() => router.push('/CommunityPost')}>
            <Ionicons name="add-circle" size={42} color={theme.gold} />
          </TouchableOpacity>
        </View>

        {isSearching && searchResults.length > 0 && (
          <View style={[styles.dropdown, { top: insets.top + 65 }]}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFeed} tintColor={theme.gold} />}
        onScrollBeginDrag={() => setIsSearching(false)}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg },
  loadingText: { marginTop: 10, color: theme.gold, fontWeight: '600' },

  searchHeaderContainer: { zIndex: 100, backgroundColor: theme.bg, paddingHorizontal: 10, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtnAction: {
    width: 40,
    height: 40,
    backgroundColor: theme.card,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },

  searchBar: { 
    flex: 1, 
    backgroundColor: theme.card, 
    borderRadius: 15, 
    paddingHorizontal: 12, 
    marginRight: 10, 
    height: 45, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: theme.border
  },
  input: { flex: 1, color: theme.text },
  dropdown: { position: 'absolute', left: 10, right: 10, backgroundColor: theme.card, borderRadius: 15, elevation: 5, padding: 10, zIndex: 1000, borderWidth: 1, borderColor: theme.border },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.border },
  resAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  resName: { fontWeight: '600', color: theme.text },

  centerContainer: { alignItems: 'center', marginTop: 20 },
  card: { width: width * 0.92, backgroundColor: theme.card, borderRadius: 25, padding: 15, borderWidth: 1, borderColor: theme.border },
  headerArea: { marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 12, borderWidth: 1.5, borderColor: theme.gold },
  username: { fontWeight: 'bold', fontSize: 15, color: theme.text },
  dateText: { fontSize: 10, color: theme.muted },

  imageBox: { width: '100%', height: 400, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  mainImg: { width: '100%', height: '100%' },
  
  commentOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '75%', 
    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.gold
  },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: theme.border, paddingBottom: 5 },
  overlayTitle: { color: theme.gold, fontWeight: 'bold', fontSize: 14 },
  overlayScroll: { flex: 1 },
  commentLine: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' },
  cUser: { color: theme.gold, fontWeight: 'bold', fontSize: 13 },
  cText: { color: '#EEE', fontSize: 14, lineHeight: 20 },
  noCommentsText: { color: theme.muted, fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },

  captionRow: { marginTop: 15 },
  captionText: { fontSize: 14, color: '#DDD' },
  boldUser: { fontWeight: 'bold', color: theme.gold },

  actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  count: { marginLeft: 6, fontWeight: '700', color: theme.text },

  bottomInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    borderRadius: 15, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.border
  },
  bottomInput: { flex: 1, fontSize: 14, color: theme.text, height: 40 }
});