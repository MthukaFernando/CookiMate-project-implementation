import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageSourcePropType,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  FlatList,
  ActivityIndicator,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const SPACING = 12;
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const theme = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  accent: "#FFD54F",
};

// --- COMPONENTS ---

type NavCardProps = {
  title: string;
  imageSource: ImageSourcePropType;
  href: string;
  badgeText: string;
  iconName: string;
};

const NavCard = ({ title, imageSource, href, badgeText, iconName }: NavCardProps) => {
  const scale = new Animated.Value(1);
  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => router.push(href as any)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.navCard}
      >
        <Image source={imageSource} style={styles.navImage} />
        <View style={styles.cardOverlay} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name={iconName as any} size={20} color={theme.accent} />
            <Text style={styles.navTitle}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>Tap to explore</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

function HomePage() {
  const [message, setMessage] = useState("Hi! What would you like to cook today?");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const messages = [
      "Let's cook something amazing!",
      "Try an AI recipe today!",
      "What's in your fridge?",
      "I'm hungry just thinking about it!",
    ];
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchRandomRecipes();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      const favIds = response.data.favorites.map((f: any) => f.id);
      setFavorites(favIds);
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  };

  const fetchRandomRecipes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes/random`);
      setRecipes(response.data);
    } catch (error) {
      console.log("Random recipe fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "Please log in to save recipes.");
      return;
    }
    const isFav = favorites.includes(recipeId);
    try {
      if (isFav) {
        await axios.put(`${API_URL}/api/users/favorites/remove/${uid}`, { recipeId });
        setFavorites(prev => prev.filter(id => id !== recipeId));
      } else {
        await axios.put(`${API_URL}/api/users/favorites/${uid}`, { recipeId });
        setFavorites(prev => [...prev, recipeId]);
      }
    } catch (error) {
      console.log("Toggle favorite error:", error);
    }
  };

  const renderRecipe = ({ item }: any) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <Pressable style={styles.randomCard} onPress={() => router.push(`/recipe/${item.id}`)}>
        <Image source={{ uri: item.image }} style={styles.randomImage} />
        <View style={styles.randomInfo}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.randomTitle} numberOfLines={1}>{item.name}</Text>
            <Pressable hitSlop={10} onPress={() => toggleFavorite(item.id)}>
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#e74c3c" : theme.accent}
              />
            </Pressable>
          </View>
          <Text style={styles.randomDescription} numberOfLines={2}>
            {item.description || item.cuisine || "Tap to see ingredients and steps."}
          </Text>
          <View style={styles.viewButtonSmall}>
            <Text style={styles.viewButtonTextSmall}>View Recipe</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: theme.background }}>
          <LinearGradient 
            colors={["#D4AF37", "#4e390c", theme.background]} 
            style={styles.header}
            locations={[0, 0.5, 0.9]} 
          >
            <SafeAreaView style={styles.headerContent}>
              <Text style={styles.welcome}>Welcome Back </Text>
              
              <View style={styles.mascotContainer}>
                <Image
                  source={require("../../assets/images/Home-page-Mascot.png")}
                  style={styles.mascotLarge}
                />
                <View style={styles.bubbleContainer}>
                  <View style={styles.bubble}>
                    <Text style={styles.bubbleText}>{message}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="menu-left" 
                    size={40} 
                    color="#fff" 
                    style={styles.bubbleTail} 
                  />
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        <View style={styles.contentBody}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING * 2}
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            <NavCard title="Find Recipes" imageSource={require("../../assets/images/recipes.png")} href="/menuPlanerPage" badgeText="100+ recipes" iconName="silverware-fork-knife" />
            <NavCard title="Generate Recipes" imageSource={require("../../assets/images/ai.png")} href="/menuPlanerPage" badgeText="AI powered" iconName="robot" />
            <NavCard title="Community" imageSource={require("../../assets/images/community.png")} href="Community/CommunityFeedCards" badgeText="Share food" iconName="account-group" />
          </ScrollView>

          <Text style={styles.sectionHeading}>Recommended For You</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} />
          ) : (
            <FlatList
              data={recipes}
              renderItem={renderRecipe}
              keyExtractor={(item: any) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { height: HEADER_HEIGHT, paddingHorizontal: 25 },
  headerContent: { flex: 1, justifyContent: "space-between" },
  welcome: { fontSize: 28, fontWeight: "900", color: "#f8f8f8", marginTop: 10 },
  mascotContainer: { flexDirection: "row", alignItems: "flex-end", marginBottom: 40 },
  mascotLarge: { width: 160, height: 160, resizeMode: "contain" },
  bubbleContainer: { flex: 1, marginLeft: -10, marginBottom: 40 },
  bubble: { backgroundColor: "#fff", padding: 15, borderRadius: 20 },
  bubbleTail: { position: "absolute", left: -22, bottom: 5, transform: [{ rotate: "15deg" }] },
  bubbleText: { fontSize: 15, fontWeight: "700", color: "#333", lineHeight: 20 },
  contentBody: { marginTop: -20 },
  sectionHeading: { fontSize: 22, fontWeight: "800", color: "#fff", marginLeft: 25, marginTop: 10, marginBottom: 15 },
  navCard: { width: CARD_WIDTH, height: 350, borderRadius: 30, marginHorizontal: SPACING, overflow: "hidden", backgroundColor: theme.card },
  navImage: { width: "100%", height: "70%" },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', height: '70%' },
  badge: { position: "absolute", top: 15, left: 15, backgroundColor: theme.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, zIndex: 2 },
  badgeText: { fontWeight: "800", fontSize: 12, color: "#000" },
  cardFooter: { padding: 15 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  navTitle: { fontSize: 20, fontWeight: "800", color: "#fff", marginLeft: 8 },
  subtitle: { marginTop: 6, color: "#aaa", fontSize: 13 },
  randomCard: { width: 260, backgroundColor: theme.card, borderRadius: 24, marginRight: 18, overflow: "hidden", borderWidth: 1, borderColor: "#333" },
  randomImage: { width: "100%", height: 140 },
  randomInfo: { padding: 15 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  randomTitle: { color: "#fff", fontWeight: "700", fontSize: 16, flex: 1, marginRight: 10 },
  randomDescription: { color: "#aaa", fontSize: 12, marginTop: 6, lineHeight: 18, height: 36 },
  viewButtonSmall: { backgroundColor: "#4E342E", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignSelf: "flex-start", marginTop: 12 },
  viewButtonTextSmall: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  fab: { position: "absolute", bottom: 35, right: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: theme.accent, justifyContent: "center", alignItems: "center", elevation: 8 },
});

export default HomePage;