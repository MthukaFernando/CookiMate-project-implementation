import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 5;
const IMAGE_SIZE = (width - 40 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function CommunityUserProfile() {
  const { CommunityUserid, profilePic } = useLocalSearchParams();
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState(null);

  const user = {
    name: CommunityUserid || "Chef",
    handle: `@${CommunityUserid?.toString().toLowerCase().replace(/\s/g, "")}`,
    bio: "Passionate home cook! 🍳 | Dessert Lover 🍰",
    profilePic: profilePic || "https://via.placeholder.com/150",
    stats: { recipes: 24, followers: "1.2k", following: 150 },
    posts: [
      { id: '1', uri: 'https://www.halfbakedharvest.com/wp-content/uploads/2024/04/30-Minute-Honey-Garlic-Chicken-1.jpg' },
      { id: '2', uri: 'https://www.eatingwell.com/thmb/S2NGMEcgm11dtdBJ6Hwprwq-nVk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/eat-the-rainbow-chopped-salad-with-basil-mozzarella-beauty-185-278133-4000x2700-56879ac756cd46ea97944768847b7ea5.jpg' },
      { id: '3', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9TF3SqH4Bd9ubQzSBzTES6w1zoMH6-3nR9w&s' },
      { id: '4', uri: 'https://hips.hearstapps.com/hmg-prod/images/chocolate-pie-cookies-lead-66fc19fe1abd1.jpg?crop=0.6666666666666667xw:1xh;center,top' },
      { id: '5', uri: 'https://www.happyfoodstube.com/wp-content/uploads/2018/08/raspberry-oreo-no-bake-dessert-image-500x500.jpg' },
      { id: '6', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM6wseYxMw4o2bGtI1H54AT903NIK3BgTMJQ&s' },
    ],
  };

  const ProfileHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#5F4436" />
      </TouchableOpacity>
      <View style={styles.profileCard}>
        <Image source={{ uri: user.profilePic }} style={styles.avatar} />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.handle}>{user.handle}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.stats.recipes}</Text>
            <Text style={styles.statLab}>Recipes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.stats.followers}</Text>
            <Text style={styles.statLab}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.stats.following}</Text>
            <Text style={styles.statLab}>Following</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={user.posts}
        numColumns={COLUMN_COUNT}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedPost(item)}>
            <Image
              source={{ uri: item.uri }}
              style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8 }}
            />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedPost} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedPost(null)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Image
                source={{ uri: user.profilePic }}
                style={styles.modalAvatar}
              />
              <Text style={{ fontWeight: "bold" }}>{user.name}</Text>
              <TouchableOpacity
                style={{ marginLeft: "auto" }}
                onPress={() => setSelectedPost(null)}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            {selectedPost && (
              <Image
                source={{ uri: selectedPost.uri }}
                style={styles.modalImg}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  userName: { fontSize: 24, fontWeight: "800" },
  handle: { color: "#B86D2A", fontWeight: "600" },
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
  stat: { alignItems: "center" },
  statNum: { fontWeight: "bold", fontSize: 18 },
  statLab: { fontSize: 12, color: "#999" },
  followBtn: {
    backgroundColor: "#522F2F",
    width: "100%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  followBtnText: { color: "#fff", fontWeight: "bold" },
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
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 15 },
  modalAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  modalImg: { width: "100%", height: 350 },
});
