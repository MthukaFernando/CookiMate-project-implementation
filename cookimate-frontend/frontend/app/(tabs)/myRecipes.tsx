import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

// --- Get Dynamic IP for API calls ---
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const cuisineOptions = [
  { label: "All Cuisines", value: "All" },
  { label: "Italian 🍝", value: "Italian" },
  { label: "Chinese 🥡", value: "Chinese" },
  { label: "Mexican 🌮", value: "Mexican" },
  { label: "Indian 🍛", value: "Indian" },
  { label: "American 🍔", value: "American" },
  { label: "Thai 🍜", value: "Thai" },
  { label: "Japanese 🍣", value: "Japanese" },
];

const mealOptions = [
  { label: "All Meals", value: "All" },
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "Dinner", value: "Dinner" },
];
const timeOptions = [
  { label: "Any Time", value: "All" },
  { label: "Under 15 min", value: "15" },
  { label: "15-30 min", value: "30" },
];
const dietOptions = [
  { label: "All Diets", value: "All" },
  { label: "Vegetarian", value: "Vegetarian" },
  { label: "Vegan", value: "Vegan" },
];

const MyRecipesPage = () => {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [meal, setMeal] = useState("All");
  const [cuisine, setCuisine] = useState("All");
  const [diet, setDiet] = useState("All");
  const [time, setTime] = useState("All"); 

  // State to store the list of favorite recipe IDs
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from phone storage when app starts
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem('userFavorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch (error) {
      console.log("Error loading favorites", error);
    }
  };

  const toggleFavorite = async (id: string) => {
    let newFavorites;
    if (favorites.includes(id)) {
      // Remove from favorites
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      // Add to favorites
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    // Save to phone storage
    await AsyncStorage.setItem('userFavorites', JSON.stringify(newFavorites));
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

  const renderRecipeItem = ({ item }: { item: any }) => {
    // Check if this specific recipe is in our favorites list
    const isFavorite = favorites.includes(item.id);

    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage} 
        />
        <View style={styles.cardContent}>
          {/* Title and Heart Row */}
          <View style={styles.titleRow}>
            <Text style={styles.recipeTitle} numberOfLines={2}>{item.name}</Text>
            
            {/* THE HEART BUTTON */}
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#e74c3c" : "#5F4436"} // Red if liked, Brown if not
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#5F4436" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#8a6666" />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropText}
            selectedTextStyle={styles.dropText}
            data={mealOptions}
            labelField="label"
            valueField="value"
            value={meal}
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
  },
  backCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#e0d6c8",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 18,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#5F4436" },
  filterWrapper: {
    height: 50,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dropdown: {
    width: 120, 
    height: 36,
    backgroundColor: "#c6a484",
    borderRadius: 18,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  dropText: { color: "white", fontSize: 12, fontWeight: "bold", textAlign: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    padding: 15,
    alignItems: "center",
    elevation: 3,
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    marginRight: 15,
  },
  cardContent: { 
    flex: 1,
  },
  // NEW STYLE: Title row for recipe name + heart button
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
});

export default MyRecipesPage;