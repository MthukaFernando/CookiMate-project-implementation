import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar"; // Added for status bar control
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Better safe area handling
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

const cuisineOptions = [
  { label: "All Cuisines", value: "All" },
  { label: "American 🍔", value: "American" },
  { label: "Italian 🍝", value: "Italian" },
  { label: "Mexican 🌮", value: "Mexican" },
  { label: "Indian 🍛", value: "Indian" },
  { label: "Japanese 🍣", value: "Japanese" },
  { label: "Chinese 🥡", value: "Chinese" },
  { label: "French 🥖", value: "French" },
  { label: "Mediterranean 🫒", value: "Mediterranean" },
  { label: "Caribbean 🌴", value: "Caribbean" },
  { label: "Sri Lankan 🥥", value: "Sri Lankan" },
  { label: "Moroccan 🐪", value: "Moroccan" },
  { label: "Korean 🇰🇷", value: "Korean" },
  { label: "British 🇬🇧", value: "British" },
  { label: "Swiss 🧀", value: "Swiss" },
  { label: "Algerian", value: "Algerian" },
  { label: "Texan 🤠", value: "Texan" },
  { label: "Cajun/Creole ⚜️", value: "Louisiana" },
];

const mealOptions = [
  { label: "All Meals", value: "All" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snacks 🍿", value: "snack" },
  { label: "Appetizer 🥗", value: "appetizer" },
  { label: "Dessert 🍰", value: "dessert" },
  { label: "Drinks 🍹", value: "drink" },
];

const timeOptions = [
  { label: "Any Time", value: "All" },
  { label: "Under 15 min", value: "15" },
  { label: "15-30 min", value: "30" },
  { label: "30-60 min", value: "60" },
];

const dietOptions = [
  { label: "All Diets", value: "All" },
  { label: "Vegetarian 🌱", value: "vegetarian" },
  { label: "Vegan 🌿", value: "vegan" },
  { label: "Gluten-Free 🌾", value: "gluten-free" },
  { label: "Low-Carb 🥩", value: "low-carb" },
  { label: "Low-Calorie 🔥", value: "low-calorie" },
  { label: "Low-Fat 💪", value: "low-fat" },
  { label: "Low-Sodium 🧂", value: "low-sodium" },
  { label: "Diabetic-Friendly 💉", value: "diabetic" },
  { label: "Healthy 🥗", value: "healthy" },
];

const MyRecipesPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Get precise safe area values
  const { selectedCategory, selectedDate } = useLocalSearchParams();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedRecipeData, setSelectedRecipeData] = useState<any>(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [meal, setMeal] = useState((selectedCategory as string) || "All");
  const [cuisine, setCuisine] = useState("All");
  const [diet, setDiet] = useState("All");
  const [time, setTime] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  useEffect(() => {
    if (selectedCategory) {
      setMeal(selectedCategory as string);
    } else {
      setMeal("All");
    }
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      router.setParams({
        selectedCategory: undefined,
        selectedDate: undefined,
      });
    };
  }, []);

  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (cuisine !== "All") count++;
    if (meal !== "All" && meal !== (selectedCategory as string)) count++;
    if (diet !== "All") count++;
    if (time !== "All") count++;
    setActiveFilterCount(count);
  }, [searchQuery, cuisine, meal, diet, time, selectedCategory]);

  const loadFavorites = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      const favIds = response.data.favorites.map((f: any) => f.id);
      setFavorites(favIds);
    } catch (error) {
      console.error("Error loading favorites from DB:", error);
    }
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    const uid = auth.currentUser?.uid;
    try {
      await axios.put(`${API_URL}/api/users/favorites/remove/${uid}`, {
        recipeId,
      });
      setFavorites((prev) => prev.filter((id) => id !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("Error", "Could not remove from favorites.");
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "You must be logged in to save favorites");
      return;
    }

    const isCurrentlyFavorite = favorites.includes(recipeId);

    if (isCurrentlyFavorite) {
      Alert.alert(
        "Remove Favorite",
        "Are you sure you want to remove this recipe from your favorites?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => handleRemoveFavorite(recipeId),
          },
        ],
      );
    } else {
      try {
        await axios.put(`${API_URL}/api/users/favorites/${uid}`, { recipeId });
        setFavorites((prev) => [...prev, recipeId]);
      } catch (error) {
        Alert.alert("Error", "Could not add to favorites :<");
      }
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/recipes`, {
        params: {
          searchQuery: searchQuery,
          meal: meal !== "All" ? meal : undefined,
          diet: diet !== "All" ? diet : undefined,
          cuisine: cuisine !== "All" ? cuisine : undefined,
          time: time !== "All" ? time : undefined,
        },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error("Backend error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, meal, diet, cuisine, time]);

  const handleBackToPlanner = () => {
    const dateToPass = selectedDate;
    setSelectedRecipeId(null);
    setSelectedRecipeData(null);
    router.setParams({ selectedCategory: undefined, selectedDate: undefined });
    router.push({
      pathname: "/menuPlanerPage" as any,
      params: { openModalWithDate: dateToPass },
    });
  };

  const handleAddRecipeToPlanner = () => {
    if (!selectedRecipeData) return;
    const dateToPass = selectedDate;
    const recipeData = selectedRecipeData;
    const category = selectedCategory;

    setSelectedRecipeId(null);
    setSelectedRecipeData(null);
    router.setParams({ selectedCategory: undefined, selectedDate: undefined });

    router.push({
      pathname: "/menuPlanerPage" as any,
      params: {
        openModalWithDate: dateToPass,
        newRecipeId: recipeData.id,
        newRecipeName: recipeData.name,
        newRecipeImage: recipeData.image,
        newRecipeCategory: category,
      },
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setCuisine("All");
    setDiet("All");
    setTime("All");
    if (!selectedCategory) {
      setMeal("All");
    }
  };

  const renderRecipeItem = ({ item }: { item: any }) => {
    const isSelected = selectedRecipeId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (selectedCategory) {
            setSelectedRecipeId(item.id);
            setSelectedRecipeData(item);
          }
        }}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons
                name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                size={24}
                color={favorites.includes(item.id) ? "#D4AF37" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/recipe/${item.id}` as any)}
          >
            <Text style={styles.viewButtonText}>View Recipe</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => {
            if (selectedCategory) {
              handleBackToPlanner();
            } else {
              router.push("/");
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#D4AF37" />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes"
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#D4AF37" />
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
          <Text style={styles.clearButtonText}>Clear</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {selectedCategory && (
          <TouchableOpacity
            style={[styles.addButton, !selectedRecipeId && { opacity: 0.4 }]}
            onPress={handleAddRecipeToPlanner}
            disabled={!selectedRecipeId}
          >
            <Text style={styles.addLetters}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Dropdown
            style={[styles.dropdown, selectedCategory && { opacity: 0.6 }]}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            iconColor="white"
            data={mealOptions}
            labelField="label"
            valueField="value"
            value={meal}
            disable={!!selectedCategory}
            onChange={(item) => setMeal(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            iconColor="white"
            data={cuisineOptions}
            labelField="label"
            valueField="value"
            value={cuisine}
            onChange={(item) => setCuisine(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            iconColor="white"
            data={timeOptions}
            labelField="label"
            valueField="value"
            value={time}
            onChange={(item) => setTime(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            iconColor="white"
            data={dietOptions}
            labelField="label"
            valueField="value"
            value={diet}
            onChange={(item) => setDiet(item.value)}
          />
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D4AF37"
          style={{ marginTop: 50 }}
        />
      ) : recipes.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={60} color="#333333" />
          <Text style={styles.noResultsText}>No recipes found</Text>
          <Text style={styles.noResultsSubText}>
            Try adjusting your filters
          </Text>
          <TouchableOpacity
            style={styles.resetFiltersButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.resetFiltersText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipeItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10, // Reduced as insets handle the bulk
    marginBottom: 10,
    gap: 8,
  },
  backCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    minWidth: 60,
    height: 40,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
    paddingHorizontal: 10,
  },
  addLetters: {
    letterSpacing: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#D4AF37",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    height: 44,
    paddingHorizontal: 15,
    flex: 2,
    borderWidth: 1,
    borderColor: "#333333",
  },
  searchInput: { flex: 1, fontSize: 14, color: "#FFFFFF" },
  filterWrapper: { height: 50, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 15, alignItems: "center" },
  dropdown: {
    width: 120,
    height: 36,
    backgroundColor: "#FF8C00",
    borderRadius: 18,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  dropText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 20,
    marginBottom: 18,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  cardSelected: {
    borderColor: "#D4AF37",
    backgroundColor: "#1A1A1A",
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    marginRight: 15,
  },
  cardContent: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 8,
  },
  recipeDescription: {
    fontSize: 13,
    color: "#BBBBBB",
    marginBottom: 10,
    lineHeight: 18,
  },
  viewButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: { color: "#000000", fontWeight: "bold", fontSize: 12 },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF8C00",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
  },
  resetFiltersButton: {
    backgroundColor: "#FF8C00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resetFiltersText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MyRecipesPage;