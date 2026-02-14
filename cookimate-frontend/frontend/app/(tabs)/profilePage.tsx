import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { globalStyle } from "../globalStyleSheet.style";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const API_URL = "http://192.168.8.184:5000";

/* ---------------- TYPES ---------------- */
type StatCardProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string | number;
  onPress?: () => void;
};

type BadgeProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  onPress?: () => void;
};

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = "abc123456"; // 🔥 replace later with auth.currentUser?.uid

        const response = await axios.get(
          `${API_URL}/api/users/${uid}`
        );

        setUser(response.data);
      } catch (err: any) {
        console.log(err.response?.data || err.message);
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#923d0a" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.center}>
        <Text>{error || "User not found"}</Text>
      </View>
    );
  }

  return (
    <View style={globalStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user.profilePic ||
                "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
            }}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => alert("Edit Profile clicked")}
              >
                <Text style={styles.smallBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => alert("Settings clicked")}
              >
                <Text style={styles.smallBtnText}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Points: {user.points}
              </Text>
              <Text style={styles.progressText}>
                Level {user.level}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "65%" }]} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="coffee"
            label="Recipes Cooked"
            value={user.recipesCookedCount}
          />
          <StatCard
            icon="heart"
            label="Favourites"
            value={user.favorites?.length}
          />
          <StatCard
            icon="award"
            label="Level"
            value={user.level}
          />
          <StatCard
            icon="users"
            label="Followers"
            value="0"
          />
        </View>

        {/* Achievements */}
        <View style={styles.achievementBox}>
          <Text style={styles.sectionTitle}>Achievements</Text>

          <View style={styles.badgeRow}>
            <Badge icon="butterfly" text="Social Butterfly" />
            <Badge icon="silverware-fork-knife" text="Master Chef" />
            <Badge icon="leaf" text="First Recipe" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;

/* ---------------- SMALL COMPONENTS ---------------- */

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <View style={styles.statCard}>
    <Feather name={icon} size={28} color="#333" />
    <Text style={styles.statText}>{label}</Text>
    {value !== undefined && (
      <Text style={{ fontWeight: "bold", marginTop: 5 }}>
        {value}
      </Text>
    )}
  </View>
);

const Badge = ({ icon, text }: BadgeProps) => (
  <View style={styles.badge}>
    <MaterialCommunityIcons name={icon} size={28} color="#333" />
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    flexDirection: "row",
    backgroundColor: "#dfb389",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    gap: 15,
    minHeight: 150,
    alignItems: "center",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  username: {
    fontSize: 14,
    color: "#555",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 10,
  },

  smallBtn: {
    backgroundColor: "#f8f0de",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },

  smallBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  progressText: {
    fontSize: 12,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#F3E5D6",
    borderRadius: 6,
    marginTop: 6,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#923d0a",
    borderRadius: 6,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    margin: 20,
    gap: 15,
  },

  statCard: {
    width: "47%",
    backgroundColor: "#dfb389",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    gap: 12,
    minHeight: 120,
  },

  statText: {
    fontSize: 14,
    fontWeight: "500",
  },

  achievementBox: {
    backgroundColor: "#dfb389",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  badge: {
    backgroundColor: "#f8f0de",
    borderRadius: 16,
    padding: 15,
    width: "30%",
    alignItems: "center",
    gap: 8,
    minHeight: 90,
  },

  badgeText: {
    fontSize: 12,
    textAlign: "center",
  },
});
