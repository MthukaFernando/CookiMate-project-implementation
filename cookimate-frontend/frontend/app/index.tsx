import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { globalStyle } from "./globalStyleSheet.style";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type NavCardProps = {
  title: string;
  icon: string;
  bColor : string,
  description: string;
  href: string;
};
const NavCard = ({ title, icon, description, href,bColor }: NavCardProps) => {
  return (
    <Pressable
      onPress={() => router.push(href as any)}
      style={({ pressed }) => [styles.card,{ borderColor: bColor },  pressed && styles.cardPressed]}
    >
      <View style={styles.iconCircle}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </Pressable>
  );
};

function HomePage() {
  const [message, setMessage] = useState(
    "Hi! What would you like to cook today",
  );

  useEffect(() => {
    const messages = [
      "Hi! Are you feeling hungry?",
      "Let's make something tasty!",
      "I'm ready to help you find recipes!",
    ];

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (

    
    <ScrollView style={[styles.mainContainer , globalStyle.container]}>
      <View style={styles.topSubContainer}>
        <Text style={styles.welcomemsg}>Welcome Back!!</Text>
        <View style={styles.mascotCircle}>
          <Image
            source={require("../assets/images/Home-page-Mascot.jpg")}
            style={styles.mascotImg}
          />
        </View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>

          <View style={styles.bubbleTail} />
        </View>
      </View>
      <View style={styles.bottomSubContainer}>
        <NavCard
          title="Find Recipes"
          icon="🔍"
          href="/loginPage"
          description="Tell me what's in your kitchen"
          bColor= "#f1d15cc1"
          
        />
        <NavCard
          title="Generate Custom"
          icon="✨"
          href="/loginPage"
          description="AI will create a recipe for you"
         bColor= "#d97c54c1"
        ></NavCard>
        <NavCard
          title="Community"
          icon="👥"
          href="/loginPage"
          description="See what others are cooking"
          bColor= "#edd95ac1"
        ></NavCard>
      
      </View>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
     borderWidth: 2,
    borderColor:'red',
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "#f9f9f9cb",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1919be" },

  cardDescription: { fontSize: 14, color: "#777", marginTop: 2 },

  mainContainer: {
    paddingInline: 25,
    
    
    borderStyle: "solid",
  },
  bottomSubContainer: {
   
    padding: 20,
   
    marginBottom:20,
    borderRadius: 20,
   
  },
  topSubContainer: {
    borderWidth: 1,
    borderColor: "#f0871f45",
    borderStyle: "solid",
    padding: 15,
    alignItems: "center",
    
    borderRadius: 20,
    backgroundColor: "#eab17745",
  },
  mascotCircle: {
    width: 225,
    height: 225,
    borderWidth: 1,
    borderColor: "#e6391b",
    borderStyle: "solid",
    padding: 25,

    borderRadius: 150,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  mascotImg: { width: "100%", height: "100%" },
  welcomemsg: {
    marginRight: "auto",

    marginBottom: 10,
    fontSize: 22,
    padding: 0,
  },
  bubble: {
    backgroundColor: "#ffffff",
    paddingTop: 10,
    paddingInline: 10,
    paddingBottom: 10,
    borderRadius: 20,
    marginTop: 10,
    maxWidth: "90%",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
  },
  bubbleText: {
    fontSize: 16,
    color: "#5D4037",
    textAlign: "center",
  },
  bubbleTail: {
    position: "absolute",
    top: -8,
    left: "20%",
    marginLeft: -10,
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
    zIndex: -1,
  },
});

export default HomePage;
