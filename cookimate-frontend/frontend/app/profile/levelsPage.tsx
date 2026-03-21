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

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const statKeysMap: any = {
  cookRecipes: "recipesCooked",
  saveFavorites: "favoritesSaved",
  shareRecipes: "postsShared",
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

        const userRes = await axios.get(`${API_URL}/api/users/${uid}`);
        const mongoId = userRes.data._id;

        let myLevelNum = 1;
        let myStats = {};
        try {
          const dashRes = await axios.get(
            `${API_URL}/api/gamification/user/${mongoId}/dashboard`,
          );
          if (
            dashRes.data &&
            dashRes.data.currentLevels &&
            dashRes.data.currentLevels.gamification
          ) {
            myLevelNum = dashRes.data.currentLevels.gamification.levelNumber;
            myStats = dashRes.data.stats;
          }
        } catch (e) {
          console.log("No dashboard found, using defaults");
        }

        setUserStats(myStats);
        setCurrentLevelNum(myLevelNum);

        const levelsRes = await axios.get(`${API_URL}/api/gamification/levels`);
        const allLevels = levelsRes.data;

        // Changed to >= so current level is visible for progress tracking
        const upcomingLevels = allLevels.filter(
          (lvl: any) => lvl.levelNumber >= myLevelNum,
        );
        setLevels(upcomingLevels);
      } catch (err) {
        console.error(err);
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

                    // FIX: If this is NOT the user's current level, show 0 progress
                    const isCurrentLevel =
                      selectedLevel.levelNumber === currentLevelNum;
                    const currentValue = isCurrentLevel
                      ? userStats[statKey] || 0
                      : 0;

                    const requiredValue = value as number;
                    const progressPercent = Math.min(
                      (currentValue / requiredValue) * 100,
                      100,
                    );
                    const isCompleted = currentValue >= requiredValue;

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
                              numberOfLines={1}
                            >
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </Text>
                          </View>
                          <Text style={styles.progressText}>
                            {isCurrentLevel
                              ? `${currentValue} / ${requiredValue}`
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
    <View style={[styles.cardContainer, !isCurrent && { opacity: 0.8 }]}>
      <View style={styles.cardLeft}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.cardLevelName}>{level.levelName}</Text>
          
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {level.badge?.description ||
            `Unlock this rank at ${level.minPoints} XP`}
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, !isCurrent && { backgroundColor: "#444" }]}
          activeOpacity={0.8}
          onPress={onOpenReqs}
        >
          <Text style={styles.actionBtnText} numberOfLines={1}>
            {isCurrent ? "View Progress" : "View Requirements"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRight}>
        <Image
          source={{ uri: level.badge?.imageUrl }}
          style={[
            styles.characterImg,
            !isCurrent && { tintColor: "black", opacity: 0.3 },
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
