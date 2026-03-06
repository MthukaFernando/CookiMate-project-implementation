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

/* ---------- Backend URL ---------- */

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

/* ---------- Types ---------- */

interface Post {
  id: string;
  uri: string;
  title?: string;
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
  const { CommunityUserid } = useLocalSearchParams<{ CommunityUserid: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUser = auth.currentUser;

  /* ---------- Fetch Profile ---------- */

  const fetchProfile = async () => {
    try {
      if (!CommunityUserid) return;

      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/users/community/${CommunityUserid}`,
        {
          params: {
            viewerId: currentUser?.uid,
          },
        }
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

  /* ---------- Follow / Unfollow ---------- */

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
          : prev
      );
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  /* ---------- Loading Screen ---------- */

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#522F2F" />
      </View>
    );
  }

  /* ---------- User Not Found ---------- */

  if (!profile) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>User not found</Text>
      </View>
    );
  }

  /* ---------- Profile Header ---------- */

  const ProfileHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#5F4436" />
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              profile.profilePic ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.handle}>@{profile.username}</Text>

        {profile.bio ? (
          <Text style={styles.bioText}>{profile.bio}</Text>
        ) : null}

        {/* Stats */}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats.recipes}</Text>
            <Text style={styles.statLab}>Cooked</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats.followers}</Text>
            <Text style={styles.statLab}>Followers</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.stats.following}</Text>
            <Text style={styles.statLab}>Following</Text>
          </View>
        </View>

        {/* Follow Button */}

        {currentUser?.uid !== CommunityUserid && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollowToggle}
          >
            <Text style={styles.followBtnText}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /* ---------- Render ---------- */

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={profile.posts}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item }: ListRenderItemInfo<Post>) => (
          <TouchableOpacity onPress={() => setSelectedPost(item)}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: 8,
              }}
            />
          </TouchableOpacity>
        )}
      />

      {/* ---------- Post Modal ---------- */}

      <Modal visible={!!selectedPost} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedPost(null)}
          />

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

              <Text style={{ fontWeight: "bold" }}>{profile.username}</Text>

              <TouchableOpacity
                style={{ marginLeft: "auto" }}
                onPress={() => setSelectedPost(null)}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <>
                <Image
                  source={{ uri: selectedPost.uri }}
                  style={styles.modalImg}
                />

                {selectedPost.title && (
                  <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2ece2" },

  header: { marginBottom: 20 },

  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginTop: 10,
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
    marginTop: 15,
    elevation: 4,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E8C28E",
    marginBottom: 10,
  },

  userName: {
    fontSize: 24,
    fontWeight: "800",
  },

  handle: {
    color: "#B86D2A",
    fontWeight: "600",
  },

  bioText: {
    textAlign: "center",
    marginTop: 5,
    color: "#666",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginVertical: 15,
  },

  stat: {
    alignItems: "center",
  },

  statNum: {
    fontWeight: "bold",
    fontSize: 18,
  },

  statLab: {
    fontSize: 12,
    color: "#999",
  },

  followBtn: {
    backgroundColor: "#522F2F",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },

  followingBtn: {
    backgroundColor: "#A0A0A0",
  },

  followBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  modalAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  modalImg: {
    width: "100%",
    height: 350,
  },

  modalTitle: {
    padding: 15,
    fontSize: 18,
    fontWeight: "600",
  },
});