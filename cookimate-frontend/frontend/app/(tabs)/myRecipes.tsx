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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.28;

// Updated options to match backend controller logic
const mealOptions = [
  { label: "All Meals", value: "All" },
  { label: "Breakfast 🍳", value: "Breakfast" },
  { label: "Lunch 🍛", value: "Lunch" },
  { label: "Dinner 🥡", value: "Dinner" },
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

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://172.20.10.2:5000/api/recipes`,
        {
          params: {
            searchQuery: searchQuery, 
            meal: meal !== "All" ? meal : undefined,
            diet: diet !== "All" ? diet : undefined,
            // If want add cuisine later
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

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, meal, diet]);

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
          onPress={() => router.push(`/recipe/${item.id}` as any)}
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

      <View style={styles.dropdownRow}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.dropText}
          selectedTextStyle={styles.dropText}
          data={mealOptions}
          labelField="label"
          valueField="value"
          value={meal}
          onChange={(item) => setMeal(item.value)}
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={14} color="white" />
          )}
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
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={14} color="white" />
          )}
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
          renderRightIcon={() => (
            <Ionicons name="chevron-down" size={14} color="white" />
          )}
        />
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
    marginBottom: 15,
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
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  dropdown: {
    flex: 1,
    height: 40,
    backgroundColor: "#c6a484",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  dropText: { color: "white", fontSize: 11, fontWeight: "bold" },
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
