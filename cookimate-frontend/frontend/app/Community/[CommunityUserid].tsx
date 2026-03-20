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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 5;
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
  overlayBg: "rgba(20, 20, 20, 0.95)",
};

interface Post {
  id: string; // Ensure this matches what your backend returns (might need to be _id)
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
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

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
                followers: (prev.stats.followers || 0) + (newStatus ? 1 : -1),
              },
            }
          : prev,
      );
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  // --- FIXED FRONTEND LIKE LOGIC ---
  const handleLikeToggle = async () => {
    if (!currentUser || !selectedPost) return;

    // Use current ID logic - checking if the ID exists (fallback to _id if backend uses that)
    const postId = selectedPost.id || (selectedPost as any)._id;

    try {
      // 1. Send the request
      await axios.put(`${BASE_URL}/social/${postId}/like`, {
        userId: currentUser.uid,
      });

      // 2. Since your backend returns "Post liked!" (a string),
      // we must update the local state manually.
      const isCurrentlyLiked = (selectedPost.likes || []).includes(
        currentUser.uid,
      );

      const newLikes = isCurrentlyLiked
        ? selectedPost.likes.filter((uid) => uid !== currentUser.uid)
        : [...(selectedPost.likes || []), currentUser.uid];

      const updatedPost = { ...selectedPost, likes: newLikes };

      // 3. Update the modal view
      setSelectedPost(updatedPost);

      // 4. Update the profile list view
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              posts: (prev.posts || []).map((p) => {
                const pId = p.id || (p as any)._id;
                return pId === postId ? updatedPost : p;
              }),
            }
          : prev,
      );
    } catch (error) {
      console.error("Like error:", error);
      Alert.alert("Error", "Could not process like.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentUser || !selectedPost) return;
    const postId = selectedPost.id || (selectedPost as any)._id;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/social/${postId}/comment`, {
        userId: currentUser.uid,
        text: commentText,
      });
      // Comments endpoint returns the object, so we can use res.data directly
      setSelectedPost(res.data);
      setCommentText("");
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              posts: (prev.posts || []).map((p) => {
                const pId = p.id || (p as any)._id;
                return pId === postId ? res.data : p;
              }),
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to remove this post forever?",
      [
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
                  ? {
                      ...prev,
                      posts: (prev.posts || []).filter((p) => {
                        const pId = p.id || (p as any)._id;
                        return pId !== postId;
                      }),
                    }
                  : prev,
              );
              closeModal();
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert("Error", "Could not delete post.");
            }
          },
        },
      ],
    );
  };

  const handleReportPress = () => {
    setReportModalVisible(true);
    setShowThankYou(false);
  };

  const submitReport = async (reason: string) => {
    if (!currentUser || !CommunityUserid) return;
    try {
      await axios.post(`${BASE_URL}/social/report`, {
        reporter: currentUser.uid,
        targetId: CommunityUserid,
        targetType: "user",
        reason: reason,
      });
      setShowThankYou(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not submit report.");
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setShowModalComments(false);
    setCommentText("");
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setShowThankYou(false);
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
    <View style={styles.header}>
      <View style={styles.topActionRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {currentUser?.uid !== CommunityUserid && (
          <TouchableOpacity
            onPress={handleReportPress}
            style={styles.reportBtn}
          >
            <Ionicons name="flag-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              profile.profilePic ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{profile.name || "User"}</Text>
        <Text style={styles.handle}>@{profile.username || "unknown"}</Text>
        {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats?.recipes || 0}</Text>
            <Text style={styles.statLab}>Recipes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats?.followers || 0}</Text>
            <Text style={styles.statLab}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats?.following || 0}</Text>
            <Text style={styles.statLab}>Following</Text>
          </View>
        </View>
        {currentUser?.uid !== CommunityUserid && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollowToggle}
          >
            <Text
              style={
                isFollowing ? styles.followingBtnText : styles.followBtnText
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={profile.posts || []}
        keyExtractor={(item) => item.id || (item as any)._id}
        numColumns={COLUMN_COUNT}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item }: ListRenderItemInfo<Post>) => (
          <TouchableOpacity onPress={() => setSelectedPost(item)}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: 8,
                backgroundColor: COLORS.surface,
              }}
            />
          </TouchableOpacity>
        )}
      />

      <Modal visible={reportModalVisible} transparent animationType="fade">
        <View style={styles.reportOverlay}>
          <View style={styles.reportCard}>
            {showThankYou ? (
              <View style={styles.thankYouArea}>
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={COLORS.primaryGold}
                />
                <Text style={styles.thankYouTitle}>User Reported</Text>
                <Text style={styles.thankYouText}>
                  Thank you for your report.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalBtnAction,
                    { backgroundColor: COLORS.primaryGold, width: "100%" },
                  ]}
                  onPress={closeReportModal}
                >
                  <Text
                    style={{
                      color: COLORS.background,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.modalHeaderReport}>
                  <Text style={styles.reportModalTitle}>Report User</Text>
                  <TouchableOpacity onPress={closeReportModal}>
                    <Ionicons name="close" size={24} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {["Harassment", "Spam", "Inappropriate Profile", "Other"].map(
                  (reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={styles.optionBtn}
                      onPress={() => submitReport(reason)}
                    >
                      <Text style={styles.optionText}>{reason}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={COLORS.primaryGold}
                      />
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedPost} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Image
                source={{
                  uri:
                    profile.profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.modalAvatar}
              />
              <Text style={styles.modalUserTitle}>{profile.username}</Text>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: "auto",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                {currentUser?.uid === CommunityUserid && (
                  <TouchableOpacity
                    onPress={() =>
                      selectedPost &&
                      handleDeletePost(
                        selectedPost.id || (selectedPost as any)._id,
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.accentRed}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {selectedPost && (
              <View>
                <ScrollView bounces={false}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: selectedPost.uri }}
                      style={styles.modalImg}
                    />
                    {showModalComments && (
                      <View style={styles.commentOverlay}>
                        <View style={styles.overlayHeader}>
                          <Text style={styles.overlayTitle}>Comments</Text>
                          <TouchableOpacity
                            onPress={() => setShowModalComments(false)}
                          >
                            <Ionicons
                              name="chevron-down"
                              size={22}
                              color={COLORS.primaryGold}
                            />
                          </TouchableOpacity>
                        </View>
                        <ScrollView
                          nestedScrollEnabled
                          style={styles.overlayScroll}
                        >
                          {(selectedPost?.comments || []).length > 0 ? (
                            selectedPost.comments.map((c, index) => (
                              <View key={index} style={styles.commentLine}>
                                <Text style={styles.cUser}>
                                  {c.user?.username}{" "}
                                </Text>
                                <Text style={styles.cText}>{c.text}</Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noCommentsText}>
                              No comments yet.
                            </Text>
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={handleLikeToggle}
                    >
                      <Ionicons
                        name={
                          (selectedPost?.likes || []).includes(
                            currentUser?.uid || "",
                          )
                            ? "heart"
                            : "heart-outline"
                        }
                        size={24}
                        color={
                          (selectedPost?.likes || []).includes(
                            currentUser?.uid || "",
                          )
                            ? COLORS.accentRed
                            : COLORS.textLight
                        }
                      />
                      <Text style={styles.actionText}>
                        {(selectedPost?.likes || []).length}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setShowModalComments(!showModalComments)}
                    >
                      <Ionicons
                        name={
                          showModalComments
                            ? "chatbubble"
                            : "chatbubble-outline"
                        }
                        size={22}
                        color={COLORS.textLight}
                      />
                      <Text style={styles.actionText}>
                        {(selectedPost?.comments || []).length}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.captionArea}>
                    {selectedPost.caption && (
                      <Text style={styles.modalCaption}>
                        <Text style={styles.cUser}>{profile.username} </Text>
                        {selectedPost.caption}
                      </Text>
                    )}
                  </View>
                </ScrollView>

                {showModalComments && (
                  <View style={styles.bottomInputContainer}>
                    <TextInput
                      style={styles.bottomInput}
                      placeholder="Add a comment..."
                      placeholderTextColor="#666"
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity
                      onPress={handleCommentSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primaryGold}
                        />
                      ) : (
                        <Ionicons
                          name="send"
                          size={20}
                          color={COLORS.primaryGold}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { marginBottom: 20 },
  topActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primaryGold,
    marginBottom: 10,
  },
  userName: { fontSize: 24, fontWeight: "800", color: COLORS.textLight },
  handle: { color: COLORS.primaryGold, fontWeight: "600" },
  bioText: {
    textAlign: "center",
    marginTop: 8,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 15,
  },
  stat: { alignItems: "center" },
  statNum: { fontWeight: "bold", fontSize: 18, color: COLORS.textLight },
  statLab: { fontSize: 12, color: COLORS.textMuted },
  followBtn: {
    backgroundColor: COLORS.primaryGold,
    width: "100%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  followingBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  followingBtnText: { color: "green", fontWeight: "bold" },
  followBtnText: { color: COLORS.background, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryGold,
  },
  modalUserTitle: { color: COLORS.textLight, fontWeight: "bold" },
  imageWrapper: {
    width: "100%",
    height: width * 0.9,
    position: "relative",
    backgroundColor: "#000",
  },
  modalImg: { width: "100%", height: "100%" },
  commentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: COLORS.overlayBg,
    padding: 15,
    zIndex: 10,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  overlayTitle: { color: COLORS.textLight, fontWeight: "bold", fontSize: 14 },
  overlayScroll: { flex: 1 },
  commentLine: { flexDirection: "row", marginBottom: 12, flexWrap: "wrap" },
  cUser: { color: COLORS.primaryGold, fontWeight: "bold", fontSize: 13 },
  cText: { color: COLORS.textLight, fontSize: 14, lineHeight: 18 },
  noCommentsText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
  },
  modalActionRow: { flexDirection: "row", padding: 15, gap: 20 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontWeight: "700", color: COLORS.textLight },
  captionArea: { paddingHorizontal: 15, paddingBottom: 15 },
  modalCaption: { fontSize: 14, color: COLORS.textLight, lineHeight: 18 },
  bottomInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomInput: { flex: 1, color: COLORS.textLight, fontSize: 14 },
  reportOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportCard: {
    width: "88%",
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeaderReport: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reportModalTitle: {
    color: COLORS.primaryGold,
    fontSize: 18,
    fontWeight: "bold",
  },
  optionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: { color: COLORS.textLight, fontWeight: "600" },
  thankYouArea: { alignItems: "center", padding: 10 },
  thankYouTitle: {
    color: COLORS.primaryGold,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  thankYouText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtnAction: { paddingVertical: 12, borderRadius: 10 },
});
