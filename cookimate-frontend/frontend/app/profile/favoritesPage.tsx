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
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
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

const FavoritesPage = () => {
  const router = useRouter();
  const uid = auth.currentUser?.uid;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meal, setMeal] = useState("All");
  const [cuisine, setCuisine] = useState("All");
  const [diet, setDiet] = useState("All");
  const [time, setTime] = useState("All");
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    buttons: { text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void }[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  const showAlert = (
    title: string,
    message: string,
    buttons: { text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void }[] = [{ text: "OK" }],
    icon?: string
  ) => setAlertConfig({ visible: true, title, message, buttons, icon });

  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (cuisine !== "All") count++;
    if (meal !== "All") count++;
    if (diet !== "All") count++;
    if (time !== "All") count++;
    setActiveFilterCount(count);
  }, [searchQuery, cuisine, meal, diet, time]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      let favoriteList = response.data.favorites || [];

      let filtered = favoriteList.filter((item: any) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesMeal =
          meal === "All" || item.meal_type?.includes(meal.toLowerCase());
        const matchesCuisine =
          cuisine === "All" || item.cuisine?.includes(cuisine);
        const matchesDiet =
          diet === "All" || item.search_terms?.includes(diet.toLowerCase());

        let matchesTime = true;
        if (time !== "All" && item.totalTime) {
          const timeStr = item.totalTime.toLowerCase();
          let totalMinutes = 0;

          const hourMatch = timeStr.match(/(\d+)\s*h/);
          if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;

          const minMatch = timeStr.match(/(\d+)\s*m/);
          if (minMatch) {
            totalMinutes += parseInt(minMatch[1]);
          } else if (!hourMatch) {
            const fallbackMatch = timeStr.match(/\d+/);
            if (fallbackMatch) totalMinutes = parseInt(fallbackMatch[0]);
          }

          if (time === "15") matchesTime = totalMinutes <= 15;
          else if (time === "30") matchesTime = totalMinutes > 15 && totalMinutes <= 30;
          else if (time === "60") matchesTime = totalMinutes > 30 && totalMinutes <= 60;
        }

        return (
          matchesSearch &&
          matchesMeal &&
          matchesCuisine &&
          matchesDiet &&
          matchesTime
        );
      });
      setRecipes(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [searchQuery, meal, diet, cuisine, time]),
  );

  const handleDeleteGeneratedRecipe = async (recipeId: string, recipeName: string) => {
  showAlert(
    "Delete Recipe",
    `Are you sure you want to delete "${recipeName}"? This will remove it from your favorites and permanently delete it.`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              showAlert("Sign In Required", "You must be logged in to delete recipes.", [{ text: "OK" }], "lock-closed");
              return;
            }

            // Use the correct URL pattern with userId in the path
            const response = await axios.delete(
              `${API_URL}/api/recipes/generated/${recipeId}/${uid}`
            );

            if (response.data.success) {
              showAlert("Deleted", "Recipe deleted successfully.", [{ text: "OK" }], "checkmark-circle");
              // Refresh the favorites list
              fetchFavorites();
            }
          } catch (error: any) {
            console.error("Error deleting recipe:", error);
            showAlert(
              "Error",
              error.response?.data?.error || error.response?.data?.message || "Failed to delete recipe",
              [{ text: "OK" }],
              "alert-circle"
            );
          }
        }
      }
    ],
    "trash"
  );
};

  const confirmRemove = (recipeId: string, isGenerated: boolean = false, recipeName: string = "") => {
    if (isGenerated) {
      // For generated recipes, use the delete function that permanently deletes
      handleDeleteGeneratedRecipe(recipeId, recipeName);
    } else {
      // For regular recipes, just remove from favorites
      showAlert(
        "Remove Favourite",
        "Are you sure you want to remove this recipe from favourites?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: () => handleRemove(recipeId) },
        ],
        "heart-dislike"
      );
    }
  };

  const handleRemove = async (recipeId: string) => {
    try {
      await axios.put(`${API_URL}/api/users/favorites/remove/${uid}`, {
        recipeId,
      });
      setRecipes((prev) => prev.filter((item: any) => item.id !== recipeId));
    } catch (err) {
      showAlert("Error", "Could not remove recipe.", [{ text: "OK" }], "alert-circle");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setCuisine("All");
    setDiet("All");
    setTime("All");
    setMeal("All");
  };

  const renderRecipeItem = ({ item }: { item: any }) => {
    const isGenerated = item.isGenerated === true;
    
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => confirmRemove(item.id, isGenerated, item.name)}
              >
                <Feather name="trash-2" size={20} color="#aa1e0f" />
              </TouchableOpacity>
            </View>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites"
            placeholderTextColor="#999999"
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
            containerStyle={{
              backgroundColor: "#000000",
              borderWidth: 0.2,
              borderColor: "#D4AF37",
              borderRadius: 2,
            }}
            itemTextStyle={{ color: "#FFFFFF" }}
            activeColor="#333333"
            itemContainerStyle={{
              borderBottomWidth: 0.2,
              borderBottomColor: "#D4AF37",
            }}
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
            containerStyle={{
              backgroundColor: "#000000",
              borderWidth: 0.2,
              borderColor: "#D4AF37",
              borderRadius: 2,
            }}
            itemTextStyle={{ color: "#FFFFFF" }}
            activeColor="#333333"
            itemContainerStyle={{
              borderBottomWidth: 0.2,
              borderBottomColor: "#D4AF37",
            }}
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
            containerStyle={{
              backgroundColor: "#000000",
              borderWidth: 0.2,
              borderColor: "#D4AF37",
              borderRadius: 2,
            }}
            itemTextStyle={{ color: "#FFFFFF" }}
            activeColor="#333333"
            itemContainerStyle={{
              borderBottomWidth: 0.2,
              borderBottomColor: "#D4AF37",
            }}
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
            containerStyle={{
              backgroundColor: "#000000",
              borderWidth: 0.2,
              borderColor: "#D4AF37",
              borderRadius: 2,
            }}
            itemTextStyle={{ color: "#FFFFFF" }}
            activeColor="#333333"
            itemContainerStyle={{
              borderBottomWidth: 0.2,
              borderBottomColor: "#D4AF37",
            }}
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
          <Ionicons name="heart-dislike-outline" size={60} color="#3c5f3692" />
          <Text style={styles.noResultsText}>
            You have no recipes in favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item: any) => item.id}
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade" onRequestClose={hideAlert}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            {alertConfig.icon && (
              <View style={[
                styles.alertIconWrapper,
                { borderColor: alertConfig.icon === "checkmark-circle" ? "#D4AF37" : alertConfig.icon === "lock-closed" ? "#FF8C00" : "#FF5252" }
              ]}>
                <Ionicons
                  name={alertConfig.icon as any}
                  size={30}
                  color={alertConfig.icon === "checkmark-circle" ? "#D4AF37" : alertConfig.icon === "lock-closed" ? "#FF8C00" : "#FF5252"}
                />
              </View>
            )}
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={[styles.alertButtonRow, alertConfig.buttons.length === 1 && { justifyContent: "center" }]}>
              {alertConfig.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.alertButton,
                    btn.style === "destructive" ? styles.alertButtonDestructive
                      : btn.style === "cancel" ? styles.alertButtonCancel
                      : styles.alertButtonDefault,
                  ]}
                  onPress={() => { hideAlert(); btn.onPress?.(); }}
                >
                  <Text style={[
                    styles.alertButtonText,
                    btn.style === "destructive" ? styles.alertBtnTextDestructive
                      : btn.style === "cancel" ? styles.alertBtnTextCancel
                      : styles.alertBtnTextDefault,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingTop: Constants.statusBarHeight,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 10,
    gap: 12,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderColor: "#333333",
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
    width: 110,
    height: 36,
    backgroundColor: "#FF8C00",
    borderRadius: 18,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  dropText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#1b1b1b",
    borderColor: "#1A1A1A",
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeTitle: {
    fontSize: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
    borderColor: "#333333",
    borderRadius: 20,
    borderWidth: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff1f06",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 100,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3c5f3692",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  // Custom Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  alertBox: {
    backgroundColor: "#1b1b1b",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  alertMessage: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  alertButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  alertButtonDefault: { backgroundColor: "#D4AF37" },
  alertButtonDestructive: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#FF5252" },
  alertButtonCancel: { backgroundColor: "#2A2A2A", borderWidth: 1, borderColor: "#333333" },
  alertButtonText: { fontSize: 14, fontWeight: "700" },
  alertBtnTextDefault: { color: "#000000" },
  alertBtnTextDestructive: { color: "#FF5252" },
  alertBtnTextCancel: { color: "#AAAAAA" },
});

export default FavoritesPage;