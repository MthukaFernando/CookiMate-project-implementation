import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video, ResizeMode } from "expo-av";
import axios from "axios";
import Constants from "expo-constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const SPACING = 12;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const theme = {
  headerBg: "#130B00", // Gold-to-Dark Header
  mainBg: "#0A0A0A",   // The requested deep black background
  gold: "#D4AF37",
  card: "#1E1E1E",
  text: "#FFFFFF",
  accent: "#FFD54F",
};

// --- SUB-COMPONENTS ---

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
  const videoRef = useRef(null);

  useEffect(() => {
    const messages = ["Let's cook!", "AI recipes ready!", "What's in the fridge?", "I'm hungry!"];
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/recipes/random`);
      setRecipes(response.data);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }: any) => {
    return (
      <Pressable style={styles.randomCard} onPress={() => router.push(`/recipe/${item.id}`)}>
        <Image source={{ uri: item.image }} style={styles.randomImage} />
        <View style={styles.randomInfo}>
          <Text style={styles.randomTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.randomDescription} numberOfLines={2}>
            {item.description || "Tap to see ingredients."}
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

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* 1. WELCOME HEADER */}
        <LinearGradient colors={[theme.gold, "#8B6300"]} style={styles.headerTop}>
          <SafeAreaView>
            <Text style={styles.welcome}>Welcome Back</Text>
          </SafeAreaView>
        </LinearGradient>

        {/* 2. VIDEO SECTION */}
        <View style={styles.videoSection}>
          <Video
            ref={videoRef}
            source={require("../../assets/videos/mascot_Home_animation.mp4")}
            style={styles.mascotVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
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

        {/* 3. CONTENT BODY (Full #0A0A0A) */}
        <View style={styles.contentBody}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING * 2}
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            <NavCard title="Find Recipes" imageSource={require("../../assets/images/recipes.png")} href="/menuPlanerPage" badgeText="100+ recipes" iconName="silverware-fork-knife" />
            <NavCard title="AI Generator" imageSource={require("../../assets/images/ai.png")} href="/menuPlanerPage" badgeText="AI powered" iconName="robot" />
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
  container: { flex: 1, backgroundColor: theme.mainBg },
  
  headerTop: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 15 },
  welcome: { fontSize: 28, fontWeight: "900", color: "#f8f8f8" },

  videoSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
    backgroundColor: theme.headerBg, // Keep top part matching the video base
  },
  mascotVideo: {
    width: '100%',
    height: '100%',
  },

  bubbleContainer: {
    position: 'absolute',
    top: '15%',
    right: 15,
    width: '55%',
    zIndex: 10
  },
  bubble: { 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  bubbleTail: { 
    position: "absolute", 
    left: -22, 
    bottom: 5, 
    transform: [{ rotate: "10deg" }] 
  },
  bubbleText: { fontSize: 13, fontWeight: "700", color: "#333", lineHeight: 18 },

  contentBody: { 
    backgroundColor: theme.mainBg, 
    marginTop: -1, // Anti-aliasing fix to prevent a gap
  },
  sectionHeading: { fontSize: 22, fontWeight: "800", color: "#fff", marginLeft: 25, marginTop: 25, marginBottom: 15 },
  
  navCard: { width: CARD_WIDTH, height: 320, borderRadius: 30, marginHorizontal: SPACING, overflow: "hidden", backgroundColor: theme.card },
  navImage: { width: "100%", height: "70%" },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', height: '70%' },
  badge: { position: "absolute", top: 15, left: 15, backgroundColor: theme.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, zIndex: 2 },
  badgeText: { fontWeight: "800", fontSize: 12, color: "#000" },
  cardFooter: { padding: 15 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  navTitle: { fontSize: 19, fontWeight: "800", color: "#fff", marginLeft: 8 },
  subtitle: { marginTop: 6, color: "#aaa", fontSize: 12 },

  randomCard: { width: 260, backgroundColor: theme.card, borderRadius: 24, marginRight: 18, overflow: "hidden" },
  randomImage: { width: "100%", height: 140 },
  randomInfo: { padding: 15 },
  randomTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  randomDescription: { color: "#aaa", fontSize: 12, marginTop: 5 },
  viewButtonSmall: { backgroundColor: "#D4AF37", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignSelf: "flex-start", marginTop: 12 },
  viewButtonTextSmall: { color: "#2a2929", fontWeight: "bold", fontSize: 12 },
  
  fab: { 
    position: "absolute", 
    bottom: 35, 
    right: 25, 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    backgroundColor: theme.accent, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5
  },
});

export default HomePage;