import React, { useState, useCallback } from "react";
import { auth } from "../../config/firebase";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { globalStyle } from "../globalStyleSheet.style";
import Constants from "expo-constants";
import GlobalChatbot from "../GlobalChatbot"; // 1. Added Import

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png";

const statKeysMap: any = {
  cookRecipes: "recipesCooked",
  saveFavorites: "favoritesSaved",
  sharePosts: "postsShared",
  getLikes: "likesReceived",
  useAIGenerator: "aiGenerations",
  planMeals: "mealsPlanned",
};

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [completedLevels, setCompletedLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const fetchData = async () => {
  try {
    setLoading(true);
    // 1. Get the latest User data
    const userResponse = await axios.get(`${API_URL}/api/users/${uid}`);
    const userData = userResponse.data;
    setUser(userData);

    const userCurrentLevel = userData.level || 1;

    if (userData && userData._id) {
      // 2. Fetch Dashboard for the progress bar calculation
      try {
        const gamificationResponse = await axios.get(
          `${API_URL}/api/gamification/user/${userData._id}/dashboard`,
        );
        setGamification(gamificationResponse.data);
      } catch (gamificationErr) {
        console.log("No gamification data found for this user yet.");
      }

      // 3. FETCH ALL LEVELS & CALCULATE ACHIEVEMENTS
      try {
        const levelsRes = await axios.get(`${API_URL}/api/gamification/levels`);
        const allLevels = levelsRes.data;
        
        // ACHIEVEMENTS LOGIC: 
        // If user is Level 2, they finished Level 1.
        // If user is Level 3, they finished Level 1 and 2.
        const finished = allLevels.filter(
          (lvl: any) => lvl.levelNumber < userCurrentLevel
        );
        
        setCompletedLevels(finished);
      } catch (levelErr) {
        console.error("Error fetching levels for achievements", levelErr);
      }
    }
  } catch (err: any) {
    console.error("Fetch error", err.message);
  } finally {
    setLoading(false);
  }
};
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  let progressPercent = 0;
  let currentLevelName = "Rookie Cook";

  if (gamification) {
    const currentLevel = gamification.currentLevels?.gamification;
    const userStats = gamification.stats || {};

    if (currentLevel) {
      currentLevelName = currentLevel.levelName;
      const requirements = currentLevel.requirements || {};

      let totalTasks = 0;
      let totalTaskProgress = 0;

      Object.entries(requirements).forEach(([key, requiredValue]) => {
        const reqVal = requiredValue as number;
        if (reqVal > 0) {
          totalTasks++;
          const statKey = statKeysMap[key];
          const currentValue = userStats[statKey] || 0;
          const taskPercent = Math.min((currentValue / reqVal) * 100, 100);
          totalTaskProgress += taskPercent;
        }
      });

      if (totalTasks > 0) {
        progressPercent = totalTaskProgress / totalTasks;
      } else {
        progressPercent = 100;
      }
    }
  }

  progressPercent = Math.max(0, Math.min(progressPercent, 100));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={globalStyle.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP PROFILE CARD */}
        <View style={styles.topSubContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.mascotCircle}>
              <Image
                source={{ uri: user?.profilePic || DEFAULT_AVATAR }}
                style={styles.mascotImg}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.nameText}>{user?.name}</Text>
              <Text style={styles.usernameText}>@{user?.username}</Text>
              {user?.bio ? (
                <Text style={styles.bioText}>{user.bio}</Text>
              ) : (
                <Text style={styles.bioPlaceholder}>
                  No bio yet — tap Edit Profile to add one!
                </Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  activeOpacity={0.7}
                  onPress={() => router.push("/profile/editprofile")}
                >
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingsBtn}
                  activeOpacity={0.7}
                  onPress={() => router.push("/profile/settings")}
                >
                  <Feather name="settings" size={18} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.levelContainer}>
            <View style={styles.levelLabelRow}>
              <Text style={styles.levelLabel}>{currentLevelName}</Text>
              <Text style={styles.pointsLabel}>
                {Math.round(progressPercent)}% / 100%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>
        </View>

        {/* 2. STATS SECTION (Cleaned up Nesting) */}
        <View style={styles.bottomSubContainer}>
          <Text style={styles.sectionTitle}>Cooking Journey</Text>
          <View style={styles.statsGrid}>
            <StatItem
              icon="coffee"
              label="Cooked"
              // CHANGED: Use lifetime total from user model, not the capped dashboard stats
              value={user?.recipesCookedCount || 0}
              onPress={() => router.push("/profile/cookedHistory" as any)}
            />
            <StatItem
              icon="heart"
              label="Favs"
              // CHANGED: Use lifetime total array length from user model
              value={user?.favorites?.length || 0}
              onPress={() => router.push("/profile/favoritesPage")}
            />
            <StatItem
              icon="award"
              label="Level"
              value={user?.level || 1}
              onPress={() => router.push("/profile/levelsPage")}
            />
            <StatItem
              icon="users"
              label="Fans"
              value={user?.followers?.length || 0}
              onPress={() => console.log("Route to Followers")}
            />
          </View>
        </View>
        {/* 3. ACHIEVEMENTS */}
        <View style={styles.bottomSubContainer}>
  <Text style={styles.sectionTitle}>Achievements</Text>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.badgeScroll}
  >
    {completedLevels.length === 0 ? (
      <View style={{ paddingVertical: 10 }}>
        <Text style={{ color: "#555", fontStyle: "italic" }}>
          No badges earned yet. Complete your first level to unlock!
        </Text>
      </View>
    ) : (
      completedLevels.map((lvl, index) => (
        <BadgeItem
          key={lvl.levelNumber || index}
          imageUrl={lvl.badge?.imageUrl || DEFAULT_AVATAR}
          title={lvl.levelName}
        />
      ))
    )}
  </ScrollView>
</View>
      </ScrollView>
      {/* 2. Added GlobalChatbot here at the root level */}
      <GlobalChatbot />
    </SafeAreaView>
  );
};

const StatItem = ({ icon, label, value, onPress }: any) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.statCard}
    onPress={onPress}
  >
    <View style={styles.statIconCircle}>
      <Feather name={icon} size={18} color="#D4AF37" />
    </View>
    <View style={styles.statTextColumn}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const BadgeItem = ({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) => (
  <TouchableOpacity
    style={styles.badgeCard}
    activeOpacity={0.7}
    onPress={() => console.log("Achievement pressed")}
  >
    <View style={styles.badgeIconCircle}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.badgeImage}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.badgeTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0A0A" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  scrollContent: { 
    flexGrow: 1,          
    justifyContent: "center", 
    paddingHorizontal: 25, 
    paddingTop: 5,       
    paddingBottom: 100, // Slightly increased to ensure bottom items aren't behind the FAB
    backgroundColor: "#0A0A0A"
  },
  
  topSubContainer: {
    backgroundColor: "#000000",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 20 },
  mascotCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1E1E1E",
    borderWidth: 2,
    borderColor: "#D4AF37",
    overflow: "hidden",
  },
  mascotImg: { width: "100%", height: "100%" },
  headerTextContainer: { flex: 1 },
  nameText: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  usernameText: { fontSize: 14, color: "#A6A6A6", marginBottom: 6 },
  bioText: { fontSize: 13, color: "#d1cebe", marginBottom: 10, lineHeight: 18 },
  bioPlaceholder: { fontSize: 12, color: "#555555", marginBottom: 10, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10 },
  editBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editBtnText: { fontSize: 12, fontWeight: "bold", color: "#000000" },
  settingsBtn: {
    backgroundColor: "#D4AF37",
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  levelContainer: { marginTop: 20 },
  levelLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  levelLabel: { fontWeight: "bold", color: "#FFFFFF" },
  pointsLabel: { fontSize: 12, color: "#A6A6A6" },
  progressBar: {
    height: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  progressFill: { height: "100%", backgroundColor: "#D4AF37" },
  bottomSubContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginBottom: 15 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  statCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 8,
  },
  statIconCircle: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  statTextColumn: { flex: 1 },
  statValue: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  statLabel: { fontSize: 14, color: "#A6A6A6" },
  badgeScroll: { gap: 15, paddingRight: 10 },
  badgeCard: { alignItems: "center", width: 80 },
  badgeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D4AF37",
    overflow: "hidden",
  },
  badgeImage: { width: "75%", height: "75%" },
  badgeTitle: { fontSize: 11, fontWeight: "600", color: "#FFFFFF", textAlign: "center" },
});

export default ProfilePage;