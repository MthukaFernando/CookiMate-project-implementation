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

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

// --- 1. Added Cuisine Options ---
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
  const [time, setTime] = useState("All");
  const [diet, setDiet] = useState("All");
  // --- 2. Added Cuisine State ---
  const [cuisine, setCuisine] = useState("All");

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Use the IP that works for you (env variable or hardcoded)
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.6:5000';
      
      const response = await axios.get(
        `${API_URL}/api/recipes`,
        {
          params: {
            searchQuery: searchQuery,
            meal: meal !== "All" ? meal : undefined,
            diet: diet !== "All" ? diet : undefined,
            // --- 3. Added Cuisine to Params ---
            cuisine: cuisine !== "All" ? cuisine : undefined,
          },
        },
      );
      setRecipes(response.data);
    } catch (error) {
      console.error("Backend error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. Added cuisine to dependency array ---
  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, meal, diet, cuisine]);

  const renderRecipeItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.recipeTitle}>{item.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/recipe/${item.id}` as any)} // Use item.id (numeric) instead of item._id
        >
          <Text style={styles.viewButtonText}>View Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {/* --- 5. Changed to ScrollView for better layout with 4 items --- */}
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
            data={cuisineOptions} // New Cuisine Dropdown
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
          keyExtractor={(item) => item._id} 
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
  
  // Updated Styles for Scrolling Filters
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
  cardContent: { flex: 1 },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5F4436",
    marginBottom: 4,
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