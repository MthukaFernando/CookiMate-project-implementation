import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ListRenderItemInfo,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 8; 
const IMAGE_SIZE = (width - 40 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

const COLORS = {
  background: "#050505",
  primaryGold: "#D4AF37",
  surface: "#121212",
  surfaceLight: "#1E1E1E",
  textLight: "#F5F5F5",
  textMuted: "#888888",
  border: "#262626",
  accentRed: "#FF4444",
};

interface Post {
  id: string;
  uri: string;
  caption?: string;
  likes: string[];
  comments: {
    user: {
      username: string;
      profilePic: string;
    };
    text: string;
    createdAt: string;
  }[];
}

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
  bio?: string;
  isFollowing: boolean;
  stats: {
    recipes: number;
    followers: number;
    following: number;
  };
  posts: Post[];
}

export default function CommunityUserProfile() {
  const router = useRouter();
  const { CommunityUserid } = useLocalSearchParams<{
    CommunityUserid: string;
  }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showModalComments, setShowModalComments] = useState(false);

  const currentUser = auth.currentUser;

  const fetchProfile = async () => {
    try {
      if (!CommunityUserid) return;
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/users/community/${CommunityUserid}`,
        { params: { viewerId: currentUser?.uid } },
      );
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [CommunityUserid]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;
    try {
      const res = await axios.put(`${BASE_URL}/users/follow`, {
        targetUserId: CommunityUserid,
        currentUserId: currentUser.uid,
      });
      const newStatus = res.data.isFollowing;
      setIsFollowing(newStatus);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                followers: prev.stats.followers + (newStatus ? 1 : -1),
              },
            }
          : prev,
      );
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Remove Post", "This will permanently delete this memory.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/social/${postId}`, {
              data: { userId: currentUser?.uid },
            });
            setProfile((prev) =>
              prev
                ? { ...prev, posts: prev.posts.filter((p) => p.id !== postId) }
                : prev,
            );
            closeModal();
          } catch (error) {
            Alert.alert("Error", "Could not delete post.");
          }
        },
      },
    ]);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setShowModalComments(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGold} />
      </View>
    );
  }

  if (!profile) return null;

  const ProfileHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconCircle}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarGlow}>
          <Image
            source={{
              uri:
                profile.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.handle}>@{profile.username}</Text>

        {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.recipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {currentUser?.uid !== CommunityUserid && (
          <TouchableOpacity
            style={[
              styles.actionBtnPrimary,
              isFollowing && styles.actionBtnSecondary,
            ]}
            onPress={handleFollowToggle}
          >
            <Text
              style={[
                styles.btnText,
                isFollowing && { color: COLORS.textMuted },
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shared Creations</Text>
        <View style={styles.titleUnderline} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={profile.posts}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item }: ListRenderItemInfo<Post>) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.gridItem}
            onPress={() => setSelectedPost(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.gridImage} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedPost} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image
                source={{ uri: profile.profilePic }}
                style={styles.modalAvatar}
              />
              <Text style={styles.modalUserTitle}>{profile.username}</Text>
              
              <View style={styles.modalHeaderActions}>
                {currentUser?.uid === CommunityUserid && (
                  <TouchableOpacity
                    onPress={() => selectedPost && handleDeletePost(selectedPost.id)}
                    style={styles.deleteTopBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.accentRed} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                  <Ionicons name="close" size={26} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {selectedPost && (
              <ScrollView bounces={false}>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedPost.uri }}
                    style={styles.modalImage}
                  />
                </View>

                <View style={styles.interactionBar}>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.interactionBtn}>
                      <Ionicons
                        name={
                          selectedPost.likes.includes(currentUser?.uid || "")
                            ? "heart"
                            : "heart-outline"
                        }
                        size={26}
                        color={
                          selectedPost.likes.includes(currentUser?.uid || "")
                            ? COLORS.accentRed
                            : COLORS.textLight
                        }
                      />
                      <Text style={styles.interactionText}>
                        {selectedPost.likes.length}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.interactionBtn}
                      onPress={() => setShowModalComments(!showModalComments)}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={24}
                        color={COLORS.textLight}
                      />
                      <Text style={styles.interactionText}>
                        {selectedPost.comments.length}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.detailsArea}>
                  {selectedPost.caption && (
                    <Text style={styles.captionText}>
                      <Text style={styles.captionUser}>
                        {profile.username}{" "}
                      </Text>
                      {selectedPost.caption}
                    </Text>
                  )}

                  {showModalComments && (
                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsTitle}>Comments</Text>
                      {selectedPost.comments.map((c, i) => (
                        <View key={i} style={styles.commentRow}>
                          <Text style={styles.cUser}>{c.user?.username}</Text>
                          <Text style={styles.cText}>{c.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: { paddingBottom: 20 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  profileSection: { alignItems: "center", marginTop: 10 },
  avatarGlow: {
    padding: 4,
    borderRadius: 65,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  userName: {
    color: COLORS.textLight,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 15,
  },
  handle: {
    color: COLORS.primaryGold,
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bioText: {
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 12,
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 20,
    width: "100%",
    marginTop: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },
  statNumber: { color: COLORS.textLight, fontSize: 18, fontWeight: "800" },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 1,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primaryGold,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  actionBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: { color: "#000", fontWeight: "800", fontSize: 15 },
  sectionHeader: { marginTop: 40, marginBottom: 20 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "700" },
  titleUnderline: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.primaryGold,
    marginTop: 4,
  },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridImage: { width: "100%", height: "100%" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "88%",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 15,
  },
  deleteTopBtn: {
    padding: 6,
  },
  modalAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryGold,
  },
  modalUserTitle: { color: COLORS.textLight, fontWeight: "700", fontSize: 16 },
  closeBtn: { padding: 4 },
  modalImageContainer: {
    width: "100%",
    height: width,
    backgroundColor: "#000",
  },
  modalImage: { width: "100%", height: "100%" },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  row: { flexDirection: "row", gap: 20 },
  interactionBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  interactionText: { color: COLORS.textLight, fontWeight: "700" },
  detailsArea: { paddingHorizontal: 20, paddingBottom: 40 },
  captionText: { color: COLORS.textLight, lineHeight: 22, fontSize: 15 },
  captionUser: { color: COLORS.primaryGold, fontWeight: "700" },
  commentsSection: {
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
  },
  commentsTitle: {
    color: COLORS.primaryGold,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  commentRow: { marginBottom: 15 },
  cUser: {
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  cText: { color: COLORS.textMuted, fontSize: 14 },
});