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
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

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
    if (meal !== "All" && meal !== selectedCategory) count++;
    if (diet !== "All") count++;
    if (time !== "All") count++;
    setActiveFilterCount(count);
  }, [searchQuery, cuisine, meal, diet, time, selectedCategory]);

  const loadFavorites = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Fetch the user data which includes the populated favorites array
      const response = await axios.get(`${API_URL}/api/users/${uid}`);

      // Map the array to only get the custom 'id' string
      const favIds = response.data.favorites.map((f: any) => f.id);

      setFavorites(favIds);
    } catch (error) {
      console.error("Error loading favorites from DB:", error);
    }
  };
  const toggleFavorite = async (recipeId: string) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "You must be logged in to save favorites");
        return;
      }

      const isCurrentlyFavorite = favorites.includes(recipeId);

      if (isCurrentlyFavorite) {
        // Remove from Backend
        await axios.put(`${API_URL}/api/users/favorites/remove/${uid}`, {
          recipeId,
        });
        // Update local UI state
        setFavorites((prev) => prev.filter((id) => id !== recipeId));
      } else {
        // Add to Backend
        await axios.put(`${API_URL}/api/users/favorites/${uid}`, { recipeId });
        // Update local UI state
        setFavorites((prev) => [...prev, recipeId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert(
        "Error",
        "Could not update favorites. Check your internet/backend.",
      );
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
      pathname: "/menuPlanerPage",
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
      pathname: "/menuPlanerPage",
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
    const isFavorite = favorites.includes(item.id);
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
                color={favorites.includes(item.id) ? "#e74c3c" : "#5F4436"}
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
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {selectedCategory && (
          <TouchableOpacity
            style={styles.backCircle}
            onPress={handleBackToPlanner}
          >
            <Ionicons name="arrow-back" size={20} color="#437d9e" />
          </TouchableOpacity>
        )}

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#8a6666" />
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
          color="#5F4436"
          style={{ marginTop: 50 }}
        />
      ) : recipes.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={60} color="#c6a484" />
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
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2ece2" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 10,
    gap: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#dce8ef",
    elevation: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#5bacdc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addButton: {
    width: 70,
    height: 40,
    backgroundColor: "#dce8ef",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 2,
    borderColor: "#5bacdc",
  },
  addLetters: {
    letterSpacing: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#437d9e",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 18,
    elevation: 2,
    flex: 1,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#5F4436" },
  filterWrapper: { height: 50, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 15, alignItems: "center" },
  dropdown: {
    width: 120,
    height: 36,
    backgroundColor: "#c6a484",
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
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    padding: 15,
    alignItems: "center",
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#63aaf1",
    backgroundColor: "#f0f7ff",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#5F4436",
    flex: 1,
    marginRight: 8,
  },
  recipeDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
    lineHeight: 18,
  },
  viewButton: {
    backgroundColor: "#4E342E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ebe8e4",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd1cb",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#5F4436",
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e74c3c",
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
    color: "#5F4436",
    marginTop: 20,
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#8a6666",
    textAlign: "center",
    marginBottom: 30,
  },
  resetFiltersButton: {
    backgroundColor: "#c6a484",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  resetFiltersText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MyRecipesPage;
