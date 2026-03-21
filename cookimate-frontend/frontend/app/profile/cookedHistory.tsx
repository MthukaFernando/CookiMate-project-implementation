import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.25;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

// Interface to fix the "unknown" type error
interface CookedItem {
  dateCooked: string;
  recipeId: {
    id: string;
    name: string;
    image: string;
    description?: string;
  };
}

const CookedHistoryPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCookedHistory = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Fetch the user data
      const response = await axios.get<any>(`${API_URL}/api/users/${uid}`);

      if (response.data && response.data.cookedHistory) {
        const history = response.data.cookedHistory
          .filter((item: any) => item.recipeId) //Filters out any broken links
          .map((item: any) => ({
            // Accessing fields directly from the populated recipeId object
            id: item.recipeId._id,
            name: item.recipeId.name,
            image: item.recipeId.image,
            dateCooked: item.dateCooked,
            timesCooked: item.timesCooked || 1,
          }));
        setRecipes(history);
      }
    } catch (error) {
      console.error("Error fetching cooked history:", error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE FUNCTION
  const handleDelete = (recipeId: string) => {
    Alert.alert(
      "Remove Recipe",
      "Are you sure you want to remove this from your cooking history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              await axios.delete(
                `${API_URL}/api/users/history/${uid}/${recipeId}`,
              );
              // Update local state immediately
              setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            } catch (error) {
              Alert.alert("Error", "Could not delete recipe.");
            }
          },
        },
      ],
    );
  };

  // SEARCH FILTER LOGIC
  const filteredRecipes = recipes.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useFocusEffect(
    useCallback(() => {
      fetchCookedHistory();
    }, []),
  );

  const renderRecipeItem = ({ item }: { item: any }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => router.push(`/recipe/${item.id}` as any)} 
    style={styles.card}
  >
    <Image 
      source={{ uri: item.image }} 
      style={styles.cardImage} 
    />
    
    <View style={styles.cardContent}>
      {/* Container for Title and Delete Button */}
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.recipeTitle, { flex: 1 }]} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color="#D4AF37" />
        {/* Spacing between icon and date */}
        <Text style={[styles.cookedDate, { marginLeft: 10 }]}>
          Last: {new Date(item.dateCooked).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Again</Text>
        <Ionicons name="chevron-forward" size={14} color="black" />
      </View>

      {/* Mastery Badge in Bottom Right */}
      {item.timesCooked > 1 && (
        <View style={styles.masteryBadge}>
          <Ionicons name="flame" size={12} color="#D4AF37" style={{ marginRight: 2 }} />
          <Text style={styles.masteryText}>x{item.timesCooked}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cooking History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR SECTION */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search recipes..."
          placeholderTextColor="#666"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D4AF37"
          style={{ marginTop: 50 }}
        />
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chef-hat" size={80} color="#333" />
          <Text style={styles.emptyText}>No recipes cooked yet!</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/details/myRecipes" as any)}
          >
            <Text style={styles.exploreText}>Find a Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item, index) => index.toString()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", flex: 1, marginRight: 2 },
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
  listContent: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 20,
    marginBottom: 15,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  imageContainer: {
    position: "relative",
    marginRight: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
  },
  // Row to hold title and trash icon inside the card content
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  deleteButton: {
    padding: 5,
    marginTop: -2, // Slight adjustment to align with top of text
  },
  masteryBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  masteryText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Increased for better vertical rhythm
    marginTop: 2,
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 15,
  },
  cardContent: { 
    flex: 1, 
    justifyContent: "center", 
    position: "relative" // Keeps absolute Mastery badge contained
  },
  recipeTitle: {
    fontSize: 16, // Adjusted slightly to give trash icon space
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
  },
  cookedDate: { 
    fontSize: 13, 
    color: "#D4AF37",
    marginLeft: 8, // Spacing between icon and date text
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: { color: "#666", fontSize: 18, marginTop: 20, marginBottom: 20 },
  exploreButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreText: { fontWeight: "bold", color: "#000" },
});

export default CookedHistoryPage;