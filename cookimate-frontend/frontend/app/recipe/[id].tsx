import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfettiCannon from "react-native-confetti-cannon";
import { auth } from "../../config/firebase";

// Adjusted import to your provided path
import Timer from "../(tabs)/tools/timerPage";

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

/**
 * Robust helper to extract all time durations from a string.
 * Returns an array of total seconds for every match found.
 * Handles: "1/2 hour", "1 1/2 mins", "7.5 minutes", "1h 30m", etc.
 */
const extractAllTimings = (text: string): number[] => {
  if (!text) return [];

  let normalized = text.toLowerCase();

  // 1. Convert "1 1/2" to "1.5"
  normalized = normalized.replace(/(\d+)\s+(\d)\/(\d)/g, (_, whole, num, den) => 
    (parseInt(whole) + parseInt(num) / parseInt(den)).toString()
  );

  // 2. Convert standalone "1/2" to "0.5"
  normalized = normalized.replace(/(^|\s)(\d)\/(\d)/g, (_, space, num, den) => 
    space + (parseInt(num) / parseInt(den)).toString()
  );

  // 3. Match numbers followed by time units
  const timeRegex = /(\d+(?:\.\d+)?)\s*(hour|hr|h|min|minute|m)(?:s|es)?/gi;
  
  const results: number[] = [];
  let match;

  while ((match = timeRegex.exec(normalized)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('h')) {
      results.push(Math.floor(value * 3600));
    } else if (unit.startsWith('m')) {
      results.push(Math.floor(value * 60));
    }
  }

  return results;
};

/**
 * Formats seconds into a human-readable string for button labels.
 */
const formatDisplayTime = (seconds: number): string => {
  if (seconds >= 3600) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${Math.floor(seconds / 60)}m`;
};

export default function RecipeDetails() {
  const uid = auth.currentUser?.uid;
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Recipe Data & UI State
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Cooking Mode State
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Timer Integration State
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  const handleStartCooking = () => {
    setCurrentStepIndex(0);
    setCookingMode(true);
  };

  const handleNextStep = () => {
    if (recipe && recipe.steps && currentStepIndex < recipe.steps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const closeCookingMode = () => {
    setCookingMode(false);
    setCurrentStepIndex(0);
  };

  const handleTriggerTimer = (seconds: number) => {
    setActiveTimerSeconds(seconds);
    setShowTimerModal(true);
  };

  useEffect(() => {
    const checkFavorite = async (recipeId: string) => {
      try {
        if (!uid || !id) return;

        //Get the users data from the backend
        const response = await axios.get(`${API_URL}/api/users/${uid}`);

        const favorites = response.data.favorites || [];
        const isFav = favorites.some((fav: any) => fav.id === id);

        setIsFavorite(isFav);
        const storedFavs = await AsyncStorage.getItem("userFavorites");
        if (storedFavs) {
          const favorites = JSON.parse(storedFavs);
          setIsFavorite(favorites.includes(recipeId));
        }
      } catch (error) {
        console.log("Error checking favorite from DB", error);
      }
    };
    if (id) checkFavorite(id as string);
  }, [id]);

  const handleRemoveFavorite = async () => {
    try {
      // Remove from MongoDB
      await axios.put(`${API_URL}/api/users/favorites/remove/${uid}`, {
        recipeId: id,
      });
      setIsFavorite(false);
      const storedFavs = await AsyncStorage.getItem("userFavorites");
      let favorites = storedFavs ? JSON.parse(storedFavs) : [];
      if (isFavorite) {
        favorites = favorites.filter((favId: string) => favId !== (id as string));
      } else {
        favorites.push(id as string);
      }
      await AsyncStorage.setItem("userFavorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log("Error removing favorite", error);
      Alert.alert("Error", "Could not remove from favorites.");
    }
  };
  const toggleFavorite = async () => {
    if (!uid) {
      Alert.alert("Error", "You must be logged in to favorite recipes");
      return;
    }

    if (isFavorite) {
      // Show alert before removing
      Alert.alert(
        "Remove Favorite",
        "Are you sure you want to remove this recipe from your favorites?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: handleRemoveFavorite,
          },
        ],
      );
    } else {
      // Add to MongoDB immediately
      try {
        await axios.put(`${API_URL}/api/users/favorites/${uid}`, {
          recipeId: id,
        });
        setIsFavorite(true);
      } catch (error: any) {
        if (error.response?.status === 400) {
          setIsFavorite(true);
        } else {
          Alert.alert("Error", "Could not add to favorites.");
        }
      }
    }
  };

  useEffect(() => {
    const fetchRecipeDetails = async (recipeId: string) => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${recipeId}`);
        setRecipe(response.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load recipe details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipeDetails(id as string);
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5F4436" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Recipe not found"}</Text>
        <TouchableOpacity style={styles.backButtonFixed} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, { backgroundColor: "#ddd" }]} />
          )}

          <TouchableOpacity style={styles.roundBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#5F4436" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "#e74c3c" : "#5F4436"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.title}>{recipe.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#5F4436" />
              <Text style={styles.statText}>{recipe.totalTime || "N/A"}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="restaurant-outline" size={20} color="#5F4436" />
              <Text style={styles.statText}>
                {recipe.servings ? `${recipe.servings} Servings` : "General"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.startCookingButton} onPress={handleStartCooking}>
            <Ionicons name="play-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.startCookingText}>Start Cooking</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {Array.isArray(recipe.ingredients_raw_str) ? (
            recipe.ingredients_raw_str.map((ing: string, index: number) => (
              <View key={index} style={styles.listItemRow}>
                <View style={styles.bullet} />
                <Text style={styles.listItem}>{ing}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listItem}>No ingredients listed.</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Instructions</Text>
          {Array.isArray(recipe.steps) ? (
            recipe.steps.map((step: string, index: number) => {
              const timings = extractAllTimings(step);
              return (
                <View key={index} style={styles.stepContainerMain}>
                  <View style={{ flexDirection: "row", flex: 1 }}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listItem}>{step}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {timings.map((seconds, tIdx) => (
                          <TouchableOpacity
                            key={tIdx}
                            style={styles.inlineTimerButton}
                            onPress={() => handleTriggerTimer(seconds)}
                          >
                            <Ionicons name="timer-outline" size={14} color="#5F4436" />
                            <Text style={styles.inlineTimerText}>
                              {formatDisplayTime(seconds)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.listItem}>
              {recipe.instructions || "No instructions provided."}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Cooking Mode Modal */}
      <Modal visible={cookingMode} animationType="slide" transparent={false} onRequestClose={closeCookingMode}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCookingMode} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#5F4436" />
            </TouchableOpacity>

            {recipe?.steps && currentStepIndex < recipe.steps.length && (
              <Text style={styles.stepProgress}>
                Step {currentStepIndex + 1} of {recipe.steps.length}
              </Text>
            )}
          </View>

          <View style={styles.modalContent}>
            {recipe?.steps && currentStepIndex < recipe.steps.length ? (
              <View style={styles.stepCard}>
                
                {/* Watermark Number */}
                <Text style={styles.stepBigNumber}>{currentStepIndex + 1}</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.stepScrollContent}
                >
                  <Text style={styles.stepText}>
                    {recipe.steps[currentStepIndex]}
                  </Text>

                  {/* Timer Buttons */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
                    {extractAllTimings(recipe.steps[currentStepIndex]).map((seconds, tIdx) => (
                      <TouchableOpacity
                        key={tIdx}
                        style={styles.modalTimerButton}
                        onPress={() => handleTriggerTimer(seconds)}
                      >
                        <Ionicons name="timer-outline" size={24} color="#5F4436" />
                        <Text style={styles.modalTimerText}>
                          Start {formatDisplayTime(seconds)} Timer
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity style={styles.nextStepButton} onPress={handleNextStep}>
                  <Text style={styles.nextStepText}>
                    {currentStepIndex === recipe.steps.length - 1
                      ? "Finish Cooking"
                      : "Next Step"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.completedContainer}>
                
                <ConfettiCannon
                  count={200}
                  origin={{ x: -10, y: 0 }}
                  fallSpeed={2500}
                  fadeOut={true}
                />

                <View style={styles.mascotContainer}>
                  <Image
                    source={require("../../assets/images/mascot.png")}
                    style={styles.mascotImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.completedTitle}>Yum!</Text>

                <Text style={styles.completedSub}>
                  You just cooked{" "}
                  <Text style={{ fontWeight: "bold" }}>{recipe?.name}</Text>!
                </Text>

                <TouchableOpacity style={styles.doneButton} onPress={closeCookingMode}>
                  <Text style={styles.doneButtonText}>Complete Recipe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Timer Logic Overlay */}
      <Modal visible={showTimerModal} animationType="fade" transparent={false}>
        <Timer initialSeconds={activeTimerSeconds} onClose={() => setShowTimerModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2ece2" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2ece2" },
  imageWrapper: { width: "100%", height: 300, position: "relative" },
  headerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  roundBackButton: {
    position: "absolute", top: 50, left: 20, backgroundColor: "rgba(255,255,255,0.9)",
    width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 5,
  },
  startCookingButton: {
    backgroundColor: "#cbaacb", flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingVertical: 14, borderRadius: 12, marginTop: 10, marginBottom: 10, elevation: 3,
  },
  startCookingText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContainer: { flex: 1, backgroundColor: "#f2ece2" },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
  },
  closeButton: { padding: 10 },
  stepProgress: { fontSize: 16, fontWeight: "600", color: "#8a6666" },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingBottom: 40, justifyContent: "center" },
  stepCard: {
    backgroundColor: "#fff", borderRadius: 30, padding: 30, height: "80%",
    justifyContent: "space-between", alignItems: "center", elevation: 5, overflow: "hidden", position: "relative",
  },
  stepBigNumber: {
    fontSize: 240, fontWeight: "bold", color: "rgba(203, 170, 203, 0.15)",
    position: "absolute", top: 80, zIndex: -1,
  },
  stepScrollContent: { flexGrow: 1, justifyContent: "center" },
  stepText: { fontSize: 24, color: "#4a4a4a", textAlign: "center", lineHeight: 36, fontWeight: "500", marginBottom: 20 },
  nextStepButton: {
    backgroundColor: "#5F4436", flexDirection: "row", alignItems: "center",
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, width: "100%", justifyContent: "center",
  },
  nextStepText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginRight: 10 },
  completedContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  mascotContainer: { width: 250, height: 250, marginBottom: 20, justifyContent: "center", alignItems: "center" },
  mascotImage: { width: "100%", height: "100%" },
  completedTitle: { fontSize: 36, fontWeight: "900", color: "#5F4436", marginBottom: 10 },
  completedSub: { fontSize: 18, color: "#8a6666", textAlign: "center", marginBottom: 40, paddingHorizontal: 30 },
  doneButton: { backgroundColor: "#4caf50", paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  doneButtonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  heartButton: {
    position: "absolute", top: 50, right: 20, backgroundColor: "rgba(255,255,255,0.9)",
    width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 5,
  },
  contentSection: {
    flex: 1, marginTop: -30, backgroundColor: "#f2ece2",
    borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 500,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#5F4436", marginBottom: 16 },
  statsRow: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 16 },
  statItem: { flexDirection: "row", alignItems: "center", marginRight: 24 },
  statText: { color: "#5F4436", fontWeight: "600", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#dccfc6", marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#5F4436", marginBottom: 12 },
  listItemRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#cbaacb", marginTop: 8, marginRight: 10 },
  listItem: { fontSize: 16, color: "#4a4a4a", lineHeight: 24, flex: 1 },
  stepContainerMain: { marginBottom: 16 },
  stepNumber: {
    fontWeight: "bold", color: "#fff", backgroundColor: "#cbaacb",
    width: 24, height: 24, borderRadius: 12, textAlign: "center", lineHeight: 24, marginRight: 12,
  },
  errorText: { color: "red", fontSize: 16, marginBottom: 20 },
  backButtonFixed: { padding: 10, backgroundColor: "#5F4436", borderRadius: 8 },
  backButtonText: { color: "white" },

  // TIMER SPECIFIC STYLES
  inlineTimerButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#E0C2A0",
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginTop: 6,
  },
  inlineTimerText: { color: "#5F4436", fontSize: 12, fontWeight: "700", marginLeft: 4 },
  modalTimerButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#E0C2A0", paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: "#5F4436",
  },
  modalTimerText: { color: "#5F4436", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
});