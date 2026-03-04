import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { globalStyle } from "../globalStyleSheet.style";
import Svg, { Path } from "react-native-svg";
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
} from "react-native";

//The sizing for the curved border
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const SPACING = 12;

const HEADER_HEIGHT = SCREEN_HEIGHT * 0.3;

type NavCardProps = {
  title: string;
  imageSource: ImageSourcePropType;
  bColor: string;
  href: string;
  badgeText: string;
  iconName: string;
};

const NavCard = ({
  title,
  imageSource,
  href,
  bColor,
  badgeText,
  iconName,
}: NavCardProps) => (
  <Pressable
    onPress={() => router.push(href as any)}
    style={({ pressed }) => [
      styles.navCard,
      {
        backgroundColor:
          bColor === "none" ? "rgba(253, 247, 233, 0.94)" : bColor,
      },
      pressed && styles.cardPressed,
    ]}
  >
    <View style={styles.navImageWrapper}>
      <Image source={imageSource} style={styles.navImage} resizeMode="cover" />
      <View style={styles.orangeBadge}>
        <Text style={styles.orangeBadgeText}>{badgeText}</Text>
      </View>
    </View>
    <View style={styles.navTextContainer}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name={iconName as any} size={20} color="#333" />
        <Text style={styles.navTitle}>{title}</Text>
      </View>
      <View style={styles.navSubtitleContainer}>
        <Text style={styles.navSubtitle}>Tap to explore</Text>
      </View>
    </View>
  </Pressable>
);

function HomePage() {
  const [message, setMessage] = useState(
    "Hi! What would you like to cook today",
  );

  useEffect(() => {
    const messages = [
      "Hi! Are you feeling hungry?",
      "Let's make something tasty!",
      "I'm ready to help find recipes!",
    ];
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.Container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ height: HEADER_HEIGHT, width: SCREEN_WIDTH }}>
          <View style={StyleSheet.absoluteFill}>
            {/*The code for the curved border*/}
            <Svg
              height={HEADER_HEIGHT}
              width={SCREEN_WIDTH}
              viewBox={`0 0 ${SCREEN_WIDTH} ${HEADER_HEIGHT}`}
            >
              <Path
                d={`M0 0 H${SCREEN_WIDTH} V${HEADER_HEIGHT - 40} Q${SCREEN_WIDTH / 2} ${HEADER_HEIGHT + 20} 0 ${HEADER_HEIGHT - 40} Z`}
                fill="rgba(240, 217, 170, 0.8)"
              />
            </Svg>
          </View>

          <SafeAreaView>
            <View style={styles.headerContent}>
              <Text style={styles.welcomemsg}>Welcome Back!!</Text>
              <View style={styles.mascotRow}>
                <View style={styles.mascotCircle}>
                  <Image
                    source={require("../../assets/images/Home-page-Mascot.png")}
                    style={styles.mascotImg}
                  />
                </View>
                <View style={styles.bubble}>
                  <View style={styles.bubbleTail} />
                  <Text style={styles.bubbleText}>{message}</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <Text style={styles.sectionHeading}>Featured Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING * 2}
          decelerationRate="fast"
          contentContainerStyle={styles.horizontalScrollPadding}
        >
          <NavCard
            title="Find Recipes"
            imageSource={require("../../assets/images/recipes.png")}
            href="/menuPlanerPage"
            bColor="none"
            badgeText="100+ recipes"
            iconName="silverware-fork-knife" //The icon that appears next to the headings of the cards
          />
          <NavCard
            title="Generate Recipes"
            imageSource={require("../../assets/images/ai.png")}
            href="/menuPlanerPage"
            bColor="none"
            badgeText="fast responses"
            iconName="robot" 
          />
          <NavCard
            title="Community"
            imageSource={require("../../assets/images/community.png")}
            href="/menuPlanerPage"
            bColor="none"
            badgeText="share journey"
            iconName="account-group"
          />
        </ScrollView>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: { flex: 1, backgroundColor: "#f2ece2" },

  headerContent: { paddingHorizontal: 25, paddingTop: 5 },

  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 15,
  },

  sectionHeading: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 15,
    color: "#333",
  },

  horizontalScrollPadding: { paddingHorizontal: 15, paddingBottom: 20 },

  navCard: {
    width: CARD_WIDTH,
    height: 380,
    marginHorizontal: SPACING,
    borderRadius: 35,
    padding: 20,
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "rgba(254, 252, 243, 0.3)",
    overflow: "hidden",
  },

  navImageWrapper: {
    flex: 1,
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  navImage: { width: "100%", height: "100%" },

  orangeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF8C42",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  
  orangeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

  navTextContainer: { backgroundColor: "transparent", paddingVertical: 10 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  navSubtitleContainer: {
    backgroundColor: "rgba(178, 219, 91, 0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    height: 30,
    justifyContent: "center",
    borderRadius: 15,
    marginTop: 8,
  },
  
  navTitle: { fontSize: 22, fontWeight: "800", color: "#333" },

  navSubtitle: { fontSize: 12, fontWeight: "700", color: "#445c16" },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(249, 246, 231, 0.6)",
  },

  mascotCircle: {
    width: 180,
    height: 180,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "none",
  },

  mascotImg: { width: "100%", height: "100%" },

  welcomemsg: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3f5a05",
    marginTop: 10,
  },

  bubble: {
    height: 80,
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
    marginLeft: 10,
  },

  bubbleText: { fontSize: 16, color: "#5D4037", fontWeight: "600" },

  bubbleTail: {
    position: "absolute",
    left: -8,
    top: "50%",
    marginTop: -8,
    width: 16,
    height: 16,
    backgroundColor: "#ffffff",
    transform: [{ rotate: "45deg" }],
    zIndex: -1,
  },
});

export default HomePage;
