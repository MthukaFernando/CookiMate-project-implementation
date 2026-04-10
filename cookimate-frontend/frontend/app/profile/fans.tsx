import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getAuth } from "firebase/auth";

// 🔥 Initialize Firebase Auth
const auth = getAuth();

// 🔥 CHANGE THIS to your PC IP (for real device testing)
const BASE_URL = "http://192.168.1.10:5000"; // ← replace with your IP

// ✅ Reusable Fan Card Component
const FanCard = ({ user }: any) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: user.profilePic }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.name}>{user.name}</Text>
      </View>
    </View>
  );
};

// ✅ Main Screen
const Fans = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Get current Firebase user
  const currentUser = auth.currentUser;
  const firebaseUid = currentUser?.uid;

  const fetchFollowers = async () => {
    try {
      if (!firebaseUid) {
        console.log("No logged-in user");
        return;
      }

      console.log("Fetching followers for:", firebaseUid);

      const res = await fetch(
        `${BASE_URL}/api/users/getfans/${firebaseUid}`
      );

      const data = await res.json();

      console.log("API RESPONSE:", data);

      setFollowers(data.followers || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  // 🔄 Loading UI
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 😢 Empty UI
  if (followers.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No followers yet 😢</Text>
      </View>
    );
  }

  // ✅ FlatList UI
  return (
    <FlatList
      data={followers}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <FanCard user={item} />}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default Fans;

// 🎨 Styles
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    marginLeft: 12,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  name: {
    color: "gray",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});