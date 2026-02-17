import React, { useState, useRef, useCallback } from "react";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import { globalStyle } from "../globalStyleSheet.style";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("window");

// --- Types ---
type RecipeCardProps = {
  title: string;
  image: any;
};

const RecipeCard = ({ title, image }: RecipeCardProps) => (
  <View style={styles.recipeCard}>
    <Image source={image} style={styles.recipeImage} />
    <View style={styles.recipeLabelContainer}>
      <Text style={styles.recipeLabelText}>{title}</Text>
    </View>
  </View>
);

function GenerateRecipesPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Animation value: starts at 2/3 down the screen (showing bottom 1/3)
  const slideAnim = useRef(new Animated.Value(height * 0.66)).current;

  // --- Reset Logic on Leave ---
  useFocusEffect(
    useCallback(() => {
      // Optional: Logic when screen comes into focus
      return () => {
        // This runs when the user navigates AWAY from the screen
        Animated.timing(slideAnim, {
          toValue: height * 0.66,
          duration: 400,
          useNativeDriver: false,
        }).start();
        setIsExpanded(false);
      };
    }, [slideAnim]),
  );

  const togglePanel = () => {
    if (!isExpanded) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
      setIsExpanded(true);
    }
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: height * 0.66,
      duration: 400,
      useNativeDriver: false,
    }).start();
    setIsExpanded(false);
  };

  const suggestedIngredients = ["Tomato", "Carrot", "Chicken"];

  const handleAddInput = () => {
    if (ingredientInput.trim().length > 0) {
      if (!selectedIngredients.includes(ingredientInput.trim())) {
        setSelectedIngredients([
          ...selectedIngredients,
          ingredientInput.trim(),
        ]);
      }
      setIngredientInput("");
    }
  };

  const handleQuickAdd = (item: string) => {
    if (!selectedIngredients.includes(item)) {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* 1. BACKGROUND IMAGE */}
      <ImageBackground
        source={require("../../assets/images/generate.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* 2. THE SLIDING PANEL */}
        <Animated.View style={[styles.slidingPanel, { top: slideAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {!isExpanded ? (
              /* THE "PREVIEW" STATE (Bottom 1/3) */
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Ready to Cook?</Text>
                <Pressable
                  style={styles.initialExpandBtn}
                  onPress={togglePanel}
                >
                  <Text style={styles.generateBtnText}>Generate Recipes</Text>
                </Pressable>
              </View>
            ) : (
              /* THE "FULL SCREEN" STATE */
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Pressable onPress={closePanel} style={styles.backArrow}>
                  <Text style={styles.backArrowText}>↓ Minimize</Text>
                </Pressable>

                <Text style={styles.headerTitle}>
                  What ingredients do you have?
                </Text>

                {/* SEARCH BAR (Chips + Input) */}
                <View style={styles.searchContainer}>
                  {selectedIngredients.map((tag, index) => (
                    <Pressable
                      key={index}
                      onPress={() => removeIngredient(index)}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{tag} ✕</Text>
                    </Pressable>
                  ))}
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      selectedIngredients.length === 0
                        ? "Type an ingredient..."
                        : "Add more..."
                    }
                    placeholderTextColor="#999"
                    value={ingredientInput}
                    onChangeText={setIngredientInput}
                    onSubmitEditing={handleAddInput}
                    blurOnSubmit={false}
                  />
                </View>

                {/* SUGGESTION BUTTONS */}
                <View style={styles.suggestionRow}>
                  {suggestedIngredients.map((item) => (
                    <Pressable
                      key={item}
                      style={styles.suggestionBtn}
                      onPress={() => handleQuickAdd(item)}
                    >
                      <Text style={styles.suggestionText}>+ {item}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* MASCOT */}
                <View style={styles.mascotSection}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatText}>I'm here to guide you!</Text>
                  </View>
                </View>

                {/* GENERATE BUTTON */}
                <Pressable
                  style={({ pressed }) => [
                    styles.mainGenerateBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => setIsModalVisible(true)}
                >
                  <Text style={styles.generateBtnText}>Get Recipes Now</Text>
                </Pressable>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </ImageBackground>

      {/* 3. MODAL POP-UP */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        <BlurView intensity={40} tint="dark" style={styles.absoluteFill}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsModalVisible(false)}
          >
            <Pressable
              style={styles.popupCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.popupHeader}>
                <Text style={styles.expandedTitle}>Generated Recipes</Text>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeX}
                >
                  <Text style={{ fontSize: 20, color: "#999" }}>✕</Text>
                </Pressable>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: "100%" }}
              >
                <RecipeCard
                  title="Corn & Parmesan Pasta"
                  image={require("../../assets/images/Home-page-Mascot.jpg")}
                />
                <RecipeCard
                  title="Garlic Herb Chicken"
                  image={require("../../assets/images/Home-page-Mascot.jpg")}
                />
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Done</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  slidingPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F5EFE6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A3B2C",
    marginBottom: 20,
  },
  initialExpandBtn: {
    backgroundColor: "#EBC390",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#CCA370",
  },
  backArrow: {
    alignSelf: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#E0D7CC",
    borderRadius: 20,
  },
  backArrowText: {
    color: "#7D6E5D",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 25,
    paddingTop: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3E3E3E",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    width: "100%",
    minHeight: 50,
    padding: 8,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  chip: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginVertical: 4,
  },
  chipText: { color: "#333", fontSize: 14, fontWeight: "500" },
  textInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
    marginLeft: 5,
  },
  suggestionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  suggestionBtn: {
    backgroundColor: "#EFE5DA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBCFB0",
  },
  suggestionText: { color: "#5D4037", fontWeight: "600", fontSize: 14 },
  mascotSection: { alignItems: "center", marginVertical: 10 },
  chatBubble: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginBottom: 5,
    borderBottomLeftRadius: 0,
  },
  chatText: { textAlign: "center", color: "#5D4037", fontSize: 15 },
  mainGenerateBtn: {
    backgroundColor: "#EBC390",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  generateBtnText: { color: "#4A3B2C", fontSize: 18, fontWeight: "bold" },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10,
  },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  popupCard: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  popupHeader: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  closeX: { position: "absolute", right: 0, padding: 5 },
  expandedTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    width: "100%",
  },
  recipeImage: { width: "100%", height: 120, backgroundColor: "#eee" },
  recipeLabelContainer: {
    backgroundColor: "#C4734D",
    padding: 10,
    alignItems: "center",
  },
  recipeLabelText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  closeBtn: {
    backgroundColor: "#2D8A4E",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  closeBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});

export default GenerateRecipesPage;
