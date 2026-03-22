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
  StatusBar,
  Animated,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Required for cross-platform safe areas
import { Video, ResizeMode } from "expo-av";
import axios from "axios";
import Constants from "expo-constants";
import GlobalChatbot from "../GlobalChatbot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VIDEO_SIZE = SCREEN_WIDTH * 0.45;
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const SPACING = 12;

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

const theme = {
  headerBg: "#130B00",
  mainBg: "#0A0A0A",
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

const NavCard = ({
  title,
  imageSource,
  href,
  badgeText,
  iconName,
}: NavCardProps) => {
  const scale = new Animated.Value(1);
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

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
            <MaterialCommunityIcons
              name={iconName as any}
              size={20}
              color={theme.accent}
            />
            <Text style={styles.navTitle}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>Tap to explore</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

function HomePage() {
  const insets = useSafeAreaInsets(); // Hook to get status bar/notch height
  const [message, setMessage] = useState("What would you like to cook?");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const messages = [
      "Let's cook!",
      "AI Chef is active.",
      "What's in the fridge?",
      "I'm hungry!",
    ];
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
      <Pressable
        style={styles.randomCard}
        onPress={() => router.push(`/recipe/${item.id}` as any)}
      >
        <Image source={{ uri: item.image }} style={styles.randomImage} />
        <View style={styles.randomInfo}>
          <Text style={styles.randomTitle} numberOfLines={1}>
            {item.name}
          </Text>
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
    // Applied dynamic padding to the top based on device inset
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.welcomeWrapper}>
          <Text style={styles.welcome}>Welcome Back</Text>
        </View>

        <View style={styles.heroContainer}>
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
          </View>

          <Animated.View
            style={[
              styles.bubbleWrapper,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            <View style={styles.bubbleBody}>
              <View style={styles.statusDot} />
              <Text style={styles.bubbleText}>{message}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.contentBody}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING * 2}
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            <NavCard
              title="Find Recipes"
              imageSource={require("../../assets/images/recipes.png")}
              href="/details/myRecipes"
              badgeText="100+ recipes"
              iconName="silverware-fork-knife"
            />
            <NavCard
              title="AI Generator"
              imageSource={require("../../assets/images/ai.png")}
              href="/details/generateRecipes"
              badgeText="AI powered"
              iconName="robot"
            />
            <NavCard
              title="Community"
              imageSource={require("../../assets/images/community.png")}
              href="Community/CommunityFeedCards"
              badgeText="Share food"
              iconName="account-group"
            />
          </ScrollView>

          <Text style={styles.sectionHeadingRecommend}>
            Recommended For You
          </Text>
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

        {/* Dynamic bottom spacing to avoid home indicator overlap */}
        <View style={{ height: 120 + insets.bottom }} />
      </ScrollView>
      <GlobalChatbot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.mainBg 
  },
  welcomeWrapper: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffe100",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: theme.mainBg,
  },
  videoSection: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE,
    borderRadius: VIDEO_SIZE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.gold,
    backgroundColor: "#000",
    marginTop: 10,
  },
  mascotVideo: {
    width: "100%",
    height: "100%",
  },
  bubbleWrapper: {
    marginTop: -10,
    zIndex: 10,
    alignItems: "center",
  },
  bubbleBody: {
    backgroundColor: "rgb(39, 39, 39)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 12,
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  contentBody: {
    backgroundColor: theme.mainBg,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 25,
    marginTop: 15,
    marginBottom: 15,
  },
  sectionHeadingRecommend: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 15,
  },
  navCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: 30,
    marginHorizontal: SPACING,
    overflow: "hidden",
    backgroundColor: theme.card,
  },
  navImage: { width: "100%", height: "70%" },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    height: "70%",
  },
  badge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 2,
  },
  badgeText: { fontWeight: "800", fontSize: 12, color: "#000" },
  cardFooter: { padding: 15 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  navTitle: { fontSize: 19, fontWeight: "800", color: "#fff", marginLeft: 8 },
  subtitle: { marginTop: 6, color: "#aaa", fontSize: 12 },
  randomCard: {
    width: 260,
    backgroundColor: theme.card,
    borderRadius: 24,
    marginRight: 18,
    overflow: "hidden",
  },
  randomImage: { width: "100%", height: 140 },
  randomInfo: { padding: 15 },
  randomTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  randomDescription: { color: "#aaa", fontSize: 12, marginTop: 5 },
  viewButtonSmall: {
    backgroundColor: theme.gold,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  viewButtonTextSmall: { color: "#222", fontWeight: "bold", fontSize: 12 },
});

export default HomePage;