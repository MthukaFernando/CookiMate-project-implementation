import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic IP detection
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if this recipe is a favorite
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const storedFavs = await AsyncStorage.getItem('userFavorites');
        if (storedFavs) {
          const favorites = JSON.parse(storedFavs);
          setIsFavorite(favorites.includes(id));
        }
      } catch (error) {
        console.log("Error checking favorite", error);
      }
    };
    
    if (id) checkFavorite();
  }, [id]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem('userFavorites');
      let favorites = storedFavs ? JSON.parse(storedFavs) : [];
      
      if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter((favId: string) => favId !== id);
      } else {
        // Add to favorites
        favorites.push(id);
      }
      
      await AsyncStorage.setItem('userFavorites', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log("Error toggling favorite", error);
    }
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load recipe details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipeDetails();
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
        <TouchableOpacity
          style={styles.backButtonFixed}
          onPress={() => router.back()}
        >
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

          {/* Back Button */}
          <TouchableOpacity
            style={styles.roundBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#5F4436" />
          </TouchableOpacity>

          {/* Heart Button on Image */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={toggleFavorite}
          >
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
            recipe.steps.map((step: string, index: number) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.listItem}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listItem}>
              {recipe.instructions || "No instructions provided."}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2ece2" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2ece2",
  },
  imageWrapper: { width: "100%", height: 300, position: "relative" },
  headerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  roundBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  // NEW: Heart button on details page
  heartButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  contentSection: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#f2ece2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5F4436",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 24,
    marginBottom: 16,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: "#5F4436", fontWeight: "600", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#dccfc6", marginVertical: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5F4436",
    marginBottom: 12,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbaacb",
    marginTop: 8,
    marginRight: 10,
  },
  listItem: { fontSize: 16, color: "#4a4a4a", lineHeight: 24, flex: 1 },
  stepContainer: { flexDirection: "row", marginBottom: 16 },
  stepNumber: {
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#cbaacb",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  },
  errorText: { color: "red", fontSize: 16, marginBottom: 20 },
  backButtonFixed: { padding: 10, backgroundColor: "#5F4436", borderRadius: 8 },
  backButtonText: { color: "white" },
});