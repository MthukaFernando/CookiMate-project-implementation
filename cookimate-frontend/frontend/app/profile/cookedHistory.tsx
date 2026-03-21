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
      <Text style={styles.recipeTitle} numberOfLines={1}>
        {item.name}
      </Text>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={12} color="#BBBBBB" />
        <Text style={styles.cookedDate}>
          Last: {new Date(item.dateCooked).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Again</Text>
        <Ionicons name="chevron-forward" size={14} color="black" />
      </View>

      {/* Badge Overlay for mastery */}
      {item.timesCooked > 1 && (
        <View style={styles.masteryBadge}>
          <Ionicons name="flame" size={12} color="#000" />
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

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D4AF37"
          style={{ marginTop: 50 }}
        />
      ) : recipes.length === 0 ? (
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
          data={recipes}
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
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
    position: 'relative',
    marginRight: 15,
  },
  masteryBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  masteryText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 15,
    marginRight: 15,
  },
  cardContent: { flex: 1, justifyContent: "center", position: 'relative' },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cookedDate: { fontSize: 13, color: "#D4AF37", marginBottom: 10 },
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
