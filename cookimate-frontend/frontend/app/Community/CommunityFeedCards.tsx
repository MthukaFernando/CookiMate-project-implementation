import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

const theme = {
  bg: "#0A0A0A",
  card: "#1E1E1E",
  gold: "#D4AF37",
  accent: "#FFD54F",
  text: "#FFFFFF",
  muted: "#AAAAAA",
  border: "#333333",
  error: "#FF3B30",
  overlay: "rgba(0, 0, 0, 0.9)",
};

export default function CommunityFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(
    null,
  );
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REPORT STATES ---
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [reportingTargetId, setReportingTargetId] = useState<string | null>(
    null,
  );
  const [showThankYou, setShowThankYou] = useState(false);
  const [reportedPostIds, setReportedPostIds] = useState<Set<string>>(
    new Set(),
  );
  const [showAlreadyReported, setShowAlreadyReported] = useState(false);

  const currentUser = auth.currentUser;
  const REPORTED_POSTS_KEY = `reported_posts_${currentUser?.uid ?? "guest"}`;

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/social/feed`, {
        params: { uid: currentUser?.uid },
      });
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const checkUserNotification = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${BASE_URL}/users/${currentUser.uid}`);
      if (res.data.lastMessage) {
        Alert.alert("Post Removed", res.data.lastMessage, [
          {
            text: "I Understand",
            onPress: async () => {
              await axios.put(
                `${BASE_URL}/users/${currentUser.uid}/clear-notification`,
              );
            },
          },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFeed();
    checkUserNotification();
    loadReportedPosts();
  }, []);

  const loadReportedPosts = async () => {
    try {
      const stored = await AsyncStorage.getItem(REPORTED_POSTS_KEY);
      if (stored) {
        setReportedPostIds(new Set(JSON.parse(stored)));
      }
    } catch (err) {
      console.error("Failed to load reported posts", err);
    }
  };

  const handleReportPress = (targetId: string) => {
    setReportingTargetId(targetId);
    setReportModalVisible(true);
    setShowOtherInput(false);
    setOtherReason("");
    setShowThankYou(false);
    setShowAlreadyReported(false);
  };

  const submitReport = async (reason: string) => {
    if (!currentUser || !reportingTargetId) return;
    try {
      await axios.post(`${BASE_URL}/social/report`, {
        reporter: currentUser.uid,
        targetId: reportingTargetId,
        targetType: "post",
        reason: reason,
      });

      const updatedSet = new Set(reportedPostIds);
      updatedSet.add(reportingTargetId);
      setReportedPostIds(updatedSet);
      await AsyncStorage.setItem(
        REPORTED_POSTS_KEY,
        JSON.stringify([...updatedSet]),
      );

      setShowThankYou(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not submit report.");
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setShowOtherInput(false);
    setOtherReason("");
    setReportingTargetId(null);
    setShowThankYou(false);
    setShowAlreadyReported(false);
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      setIsSearching(true);
      try {
        const res = await axios.get(`${BASE_URL}/users/search`, {
          params: { username: text },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.log(err);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const hasLiked = p.likes?.includes(currentUser.uid);
          const newLikes = hasLiked
            ? p.likes.filter((id: string) => id !== currentUser.uid)
            : [...(p.likes || []), currentUser.uid];
          return { ...p, likes: newLikes };
        }
        return p;
      }),
    );
    try {
      await axios.put(`${BASE_URL}/social/${postId}/like`, {
        userId: currentUser.uid,
      });
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
        text: commentText,
      });
      setPosts((prev) => prev.map((p) => (p._id === postId ? res.data : p)));
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
    const isReported = reportedPostIds.has(item._id);

    return (
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <View style={styles.headerArea}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.userRow}
                onPress={() =>
                  router.push(`/Community/${item.user?.firebaseUid}`)
                }
              >
                <Image
                  source={{ uri: item.user?.profilePic }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.username}>{item.user?.username}</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>

              {currentUser?.uid !== item.user?.firebaseUid && (
                <TouchableOpacity
                  onPress={() => {
                    if (isReported) {
                      setReportingTargetId(item._id);
                      setShowAlreadyReported(true);
                      setShowThankYou(false);
                      setShowOtherInput(false);
                      setReportModalVisible(true);
                    } else {
                      handleReportPress(item._id);
                    }
                  }}
                  style={isReported ? styles.reportedFlagBtn : undefined}
                >
                  <Ionicons
                    name={isReported ? "flag" : "flag-outline"}
                    size={20}
                    color={isReported ? theme.error : theme.muted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.imageBox}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.mainImg}
              resizeMode="cover"
            />
            {isInteracting && (
              <View style={styles.commentOverlay}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>Recent Comments</Text>
                  <TouchableOpacity
                    onPress={() => setActiveCommentPostId(null)}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={22}
                      color={theme.gold}
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  nestedScrollEnabled
                  style={styles.overlayScroll}
                  showsVerticalScrollIndicator={true}
                >
                  {item.comments?.length > 0 ? (
                    item.comments.map((c: any, i: number) => (
                      <View key={i} style={styles.commentLine}>
                        <Text style={styles.cUser}>{c.user?.username} </Text>
                        <Text style={styles.cText}>{c.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>
                      Be the first to comment!
                    </Text>
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
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleLike(item._id)}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={26}
                color={isLiked ? "#FF3B30" : theme.text}
              />
              <Text style={styles.count}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                setActiveCommentPostId(isInteracting ? null : item._id);
                setCommentText("");
              }}
            >
              <Ionicons
                name={isInteracting ? "chatbubble" : "chatbubble-outline"}
                size={24}
                color={theme.text}
              />
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
              <TouchableOpacity
                onPress={() => handleCommentSubmit(item._id)}
                disabled={isSubmitting}
              >
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <StatusBar barStyle="light-content" />

      <View
        style={[styles.searchHeaderContainer, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtnAction}
            onPress={() => router.push("/")}
          >
            <Ionicons name="arrow-back" size={26} color={theme.gold} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={18}
              color={theme.muted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Search users..."
              placeholderTextColor={theme.muted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity onPress={() => router.push("/CommunityPost")}>
            <Ionicons name="add-circle" size={42} color={theme.gold} />
          </TouchableOpacity>
        </View>

        {/* SEARCH RESULTS DROPDOWN */}
        {isSearching && searchResults.length > 0 && (
          <View style={[styles.dropdown, { top: insets.top + 65 }]}>
            {searchResults.map((u) => (
              <TouchableOpacity
                key={u._id}
                style={styles.resultItem}
                onPress={() => {
                  setIsSearching(false);
                  setSearchQuery("");
                  router.push(`/Community/${u.firebaseUid}`);
                }}
              >
                <Image
                  source={{ uri: u.profilePic }}
                  style={styles.resAvatar}
                />
                <Text style={styles.resName}>@{u.username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(p) => p._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchFeed}
            tintColor={theme.gold}
          />
        }
        onScrollBeginDrag={() => setIsSearching(false)}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      />

      {/* --- REPORT MODAL --- */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportCard}>
            {showAlreadyReported ? (
              <View style={styles.thankYouArea}>
                <Ionicons
                  name="flag"
                  size={60}
                  color={theme.error}
                  style={{ marginBottom: 15 }}
                />
                <Text style={[styles.thankYouTitle, { color: theme.error }]}>
                  Already Reported
                </Text>
                <Text style={styles.thankYouText}>
                  You've already reported this post. Our team will review it
                  shortly.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    {
                      backgroundColor: theme.error,
                      marginTop: 10,
                      width: "100%",
                    },
                  ]}
                  onPress={closeReportModal}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: "#FFF", textAlign: "center" },
                    ]}
                  >
                    Got It
                  </Text>
                </TouchableOpacity>
              </View>
            ) : showThankYou ? (
              <View style={styles.thankYouArea}>
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={theme.gold}
                  style={{ marginBottom: 15 }}
                />
                <Text style={styles.thankYouTitle}>Report Received</Text>
                <Text style={styles.thankYouText}>
                  Thank you for helping keep our community safe. Our team will
                  review this content shortly.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    {
                      backgroundColor: theme.gold,
                      marginTop: 10,
                      width: "100%",
                    },
                  ]}
                  onPress={closeReportModal}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: "#000", textAlign: "center" },
                    ]}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report Content</Text>
                  <TouchableOpacity onPress={closeReportModal}>
                    <Ionicons name="close" size={24} color={theme.muted} />
                  </TouchableOpacity>
                </View>

                {!showOtherInput ? (
                  <View style={styles.optionsList}>
                    <Text style={styles.modalSubTitle}>
                      Select a reason for reporting this post:
                    </Text>

                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => submitReport("Harassment")}
                    >
                      <Text style={styles.optionText}>Harassment</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.gold}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => submitReport("Spam")}
                    >
                      <Text style={styles.optionText}>Spam</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.gold}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => submitReport("Inappropriate Content")}
                    >
                      <Text style={styles.optionText}>
                        Inappropriate Content
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.gold}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => setShowOtherInput(true)}
                    >
                      <Text style={styles.optionText}>Other...</Text>
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={theme.gold}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.otherInputArea}>
                    <Text style={styles.modalSubTitle}>
                      Describe the issue:
                    </Text>
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Tell us more about why you are reporting this..."
                      placeholderTextColor="#666"
                      value={otherReason}
                      onChangeText={setOtherReason}
                      multiline
                      autoFocus
                    />
                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: "#333" }]}
                        onPress={() => setShowOtherInput(false)}
                      >
                        <Text style={styles.modalBtnText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          { backgroundColor: theme.gold },
                        ]}
                        onPress={() => {
                          if (otherReason.trim()) {
                            submitReport(`Other: ${otherReason}`);
                          } else {
                            Alert.alert(
                              "Input Required",
                              "Please provide a reason.",
                            );
                          }
                        }}
                      >
                        <Text style={[styles.modalBtnText, { color: "#000" }]}>
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.bg,
  },
  loadingText: { marginTop: 10, color: theme.gold, fontWeight: "600" },

  searchHeaderContainer: {
    zIndex: 100,
    backgroundColor: theme.bg,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtnAction: {
    width: 40,
    height: 40,
    backgroundColor: theme.card,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  searchBar: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 15,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  input: { flex: 1, color: theme.text },

  // --- SEARCH DROPDOWN STYLES ---
  dropdown: {
    position: "absolute",
    left: 10,
    right: 10,
    backgroundColor: theme.card,
    borderRadius: 15,
    elevation: 5,
    padding: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
  },
  resAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  resName: { fontWeight: "600", color: theme.text },

  centerContainer: { alignItems: "center", marginTop: 20 },
  card: {
    width: width * 0.92,
    backgroundColor: theme.card,
    borderRadius: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerArea: { marginBottom: 12 },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: theme.gold,
  },
  username: { fontWeight: "bold", fontSize: 15, color: theme.text },
  dateText: { fontSize: 10, color: theme.muted },

  imageBox: {
    width: "100%",
    height: 400,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  mainImg: { width: "100%", height: "100%" },

  commentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "75%",
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: theme.gold,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
    paddingBottom: 5,
  },
  overlayTitle: { color: theme.gold, fontWeight: "bold", fontSize: 14 },
  overlayScroll: { flex: 1 },
  commentLine: { flexDirection: "row", marginBottom: 12, flexWrap: "wrap" },
  cUser: { color: theme.gold, fontWeight: "bold", fontSize: 13 },
  cText: { color: "#EEE", fontSize: 14, lineHeight: 20 },
  noCommentsText: {
    color: theme.muted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  },

  captionRow: { marginTop: 15 },
  captionText: { fontSize: 14, color: "#DDD" },
  boldUser: { fontWeight: "bold", color: theme.gold },

  actionRow: {
    flexDirection: "row",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
  },
  iconBtn: { flexDirection: "row", alignItems: "center", marginRight: 25 },
  count: { marginLeft: 6, fontWeight: "700", color: theme.text },
  reportedFlagBtn: { opacity: 0.85 },

  bottomInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  bottomInput: { flex: 1, fontSize: 14, color: theme.text, height: 40 },

  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  reportCard: {
    width: "88%",
    backgroundColor: theme.card,
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.gold,
    shadowColor: theme.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border,
    paddingBottom: 10,
  },
  modalTitle: { color: theme.gold, fontSize: 18, fontWeight: "bold" },
  modalSubTitle: {
    color: theme.text,
    fontSize: 14,
    marginBottom: 15,
    fontWeight: "500",
  },
  optionsList: { gap: 10 },
  optionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionText: { color: theme.text, fontSize: 15, fontWeight: "600" },
  otherInputArea: { gap: 10 },
  modalTextInput: {
    backgroundColor: "#000",
    color: theme.text,
    borderRadius: 12,
    padding: 15,
    height: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  modalBtnText: { color: "#FFF", fontWeight: "bold" },

  thankYouArea: {
    alignItems: "center",
    paddingVertical: 10,
  },
  thankYouTitle: {
    color: theme.gold,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  thankYouText: {
    color: theme.text,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
});