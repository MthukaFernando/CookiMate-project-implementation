import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

const statKeysMap: any = {
  cookRecipes: "recipesCooked",
  saveFavorites: "favoritesSaved",
  sharePosts: "postsShared",
  getLikes: "likesReceived",
  useAIGenerator: "aiGenerations",
  planMeals: "mealsPlanned",
};

const LevelsPage = () => {
  const router = useRouter();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [userStats, setUserStats] = useState<any>({});
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // 1. Get the latest User data (including the updated level)
    const userRes = await axios.get(`${API_URL}/api/users/${uid}`);
    const userData = userRes.data;
    const mongoId = userData._id;
    const actualLevelFromUser = userData.level || 1;

    // 2. Fetch Dashboard for progress bar stats
    let myStats = {};
    try {
      const dashRes = await axios.get(`${API_URL}/api/gamification/user/${mongoId}/dashboard`);
      if (dashRes.data && dashRes.data.stats) {
        myStats = dashRes.data.stats;
      }
    } catch (e) {
      console.log("No dashboard stats found yet");
    }

    // 3. Update State
    setUserStats(myStats);
    setCurrentLevelNum(actualLevelFromUser);

    // 4. Fetch All Levels from the master list
    const levelsRes = await axios.get(`${API_URL}/api/gamification/levels`);
    const allLevels = levelsRes.data;

    // 5. FILTER LOGIC:
    // This is the "Magic": We only show levels >= the user's current level.
    // If the user finishes Level 1, actualLevelFromUser becomes 2. 
    // Level 1 disappears from the list automatically.
    const upcomingLevels = allLevels.filter(
      (lvl: any) => lvl.levelNumber >= actualLevelFromUser
    );

    setLevels(upcomingLevels);
  } catch (err) {
    console.error("Error fetching levels data:", err);
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f17501" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff200" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cooking Levels</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
      >
        {levels.length === 0 ? (
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            You have reached the maximum level!
          </Text>
        ) : (
          levels.map((lvl: any) => (
            <LevelCard
              key={lvl.levelNumber}
              level={lvl}
              isCurrent={lvl.levelNumber === currentLevelNum}
              onOpenReqs={() => {
                setSelectedLevel(lvl);
                setModalVisible(true);
              }}
            />
          ))
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {selectedLevel?.levelName} Tasks
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedLevel &&
                Object.entries(selectedLevel.requirements).map(
                  ([key, value]) => {
                    if (value === 0) return null;

                    const statKey = statKeysMap[key];
                    const isCurrentLevel =
                      selectedLevel.levelNumber === currentLevelNum;

                    // 1. Get the raw value from the backend
                    const rawValue = isCurrentLevel
                      ? userStats[statKey] || 0
                      : 0;
                    const requiredValue = value as number;

                    // 2. NEW: Create a "Display Value" that never goes above the requirement (Fixes 3/1)
                    const displayValue = Math.min(rawValue, requiredValue);

                    // 3. Calculate percentage based on the raw value
                    const progressPercent = Math.min(
                      (rawValue / requiredValue) * 100,
                      100,
                    );
                    const isCompleted = rawValue >= requiredValue;

                    return (
                      <View key={key} style={styles.requirementBlock}>
                        <View style={styles.requirementRow}>
                          <View style={styles.reqTextGroup}>
                            <Feather
                              name={
                                !isCurrentLevel
                                  ? "lock"
                                  : isCompleted
                                    ? "check-circle"
                                    : "circle"
                              }
                              size={18}
                              color={
                                !isCurrentLevel
                                  ? "#444"
                                  : isCompleted
                                    ? "#ff9500"
                                    : "#888"
                              }
                            />
                            <Text
                              style={[
                                styles.requirementText,
                                isCompleted &&
                                  isCurrentLevel &&
                                  styles.completedText,
                                !isCurrentLevel && { color: "#444" },
                              ]}
                            >
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </Text>
                          </View>

                          {/* 4. FIX: Show displayValue (1) instead of rawValue (3) */}
                          <Text style={styles.progressText}>
                            {isCurrentLevel
                              ? `${displayValue} / ${requiredValue}`
                              : "Locked"}
                          </Text>
                        </View>

                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${progressPercent}%` },
                              !isCurrentLevel && { backgroundColor: "#222" },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  },
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const LevelCard = ({ level, onOpenReqs, isCurrent }: any) => {
  return (
    <View style={[
      styles.cardContainer, 
      // If not current, make it look "dimmed" or "locked"
      !isCurrent && { opacity: 0.5, backgroundColor: "#121212", borderColor: "#333" }
    ]}>
      <View style={styles.cardLeft}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.cardLevelName, !isCurrent && { color: "#666" }]}>
            {level.levelName}
          </Text>
          {!isCurrent && <Feather name="lock" size={16} color="#666" />}
        </View>
        
        <Text style={[styles.cardDescription, !isCurrent && { color: "#444" }]} numberOfLines={2}>
          {isCurrent ? level.badge?.description : "Locked: Complete previous levels to reveal"}
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, !isCurrent && { backgroundColor: "#222" }]}
          activeOpacity={isCurrent ? 0.8 : 1}
          onPress={isCurrent ? onOpenReqs : undefined} // Disable button if locked
        >
          <Text style={[styles.actionBtnText, !isCurrent && { color: "#555" }]}>
            {isCurrent ? "View Progress" : "Locked"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRight}>
        <Image
          source={{ uri: level.badge?.imageUrl }}
          style={[
            styles.characterImg,
            // Grayscale/Dimmed effect for locked levels
            !isCurrent && { tintColor: "black", opacity: 0.2 },
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff200",
    letterSpacing: 0.5,
  },
  scrollList: { paddingHorizontal: 20, paddingBottom: 40 },
  cardContainer: {
    backgroundColor: "#1b1b1b",
    borderColor: "#1A1A1A",
    borderRadius: 30,
    height: 160,
    flexDirection: "row",
    marginBottom: 30,
    paddingLeft: 25,
    paddingRight: 10,
    paddingVertical: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardLeft: { flex: 1.4, justifyContent: "center", zIndex: 2 },
  cardLevelName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#fbffc7",
    marginBottom: 15,
    lineHeight: 18,
    width: "90%",
  },
  actionBtn: {
    backgroundColor: "#eb9f49",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignSelf: "flex-start",
    elevation: 3,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cardRight: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  characterImg: {
    width: 150,
    height: 150,
    position: "absolute",
    bottom: -15,
    right: -10,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    padding: 25,
    maxHeight: "75%",
    elevation: 20,
  },
  closeModalBtn: { alignSelf: "flex-end", padding: 5 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  requirementBlock: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 15,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reqTextGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  requirementText: {
    fontSize: 16,
    color: "#ffffff",
    textTransform: "capitalize",
  },
  completedText: { color: "#ff9500", fontWeight: "bold" },
  progressText: { fontSize: 14, color: "#888", fontWeight: "bold" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ff9500",
    borderRadius: 4,
  },
});

export default LevelsPage;
