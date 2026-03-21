import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { getAuth } from "firebase/auth";
import { auth } from "../../config/firebase";
import ConfettiCannon from "react-native-confetti-cannon";
import Timer from "../details/timerPage";
import axios from "axios";

// --- CONFIGURATION ---
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const BRAND = {
  bg: "#121212",
  surface: "#1E1E1E",
  accent: "#FFB300",
  textMain: "#FFFFFF",
  textMuted: "#A0A0A0",
  inputBg: "#2A2A2A",
  border: "#333333",
};

const QUICK_ADDS = [
  "Beef",
  "Pasta",
  "Onion",
  "Garlic",
  "Chicken",
  "Shrimp",
  "Tomato",
  "Cheese",
  "Rice",
  "Eggs",
];
const CUISINES = [
  "American",
  "Asian",
  "British",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mexican",
  "Western",
];
const MEAL_TYPES = [
  "Appetizer",
  "Breakfast",
  "Dessert",
  "Dinner",
  "Drink",
  "Lunch",
  "Snack",
];
const TIMES = ["< 15m", "< 30m", "< 45m", "1h+"];
const SERVINGS = ["1", "2", "4", "6+"];

// Helper functions for timers
const extractAllTimings = (text: string): number[] => {
  if (!text) return [];

  let normalized = text.toLowerCase();
  normalized = normalized.replace(/(\d+)\s+(\d)\/(\d)/g, (_, whole, num, den) =>
    (parseInt(whole) + parseInt(num) / parseInt(den)).toString(),
  );
  normalized = normalized.replace(
    /(^|\s)(\d)\/(\d)/g,
    (_, space, num, den) => space + (parseInt(num) / parseInt(den)).toString(),
  );
  const timeRegex = /(\d+(?:\.\d+)?)\s*(hour|hr|h|min|minute|m)(?:s|es)?/gi;

  const results: number[] = [];
  let match;

  while ((match = timeRegex.exec(normalized)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith("h")) {
      results.push(Math.floor(value * 3600));
    } else if (unit.startsWith("m")) {
      results.push(Math.floor(value * 60));
    }
  }
  return results;
};

const formatDisplayTime = (seconds: number): string => {
  if (seconds >= 3600) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${Math.floor(seconds / 60)}m`;
};

export default function GenerateRecipesPage() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const TAB_BAR_HEIGHT = 65;
  const PEEK_HEIGHT = 130;
  const EXPANDED_Y = 0;
  const COLLAPSED_Y = height - PEEK_HEIGHT - TAB_BAR_HEIGHT;

  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [culinaryPrompt, setCulinaryPrompt] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState<string | null>(null);
  const [servings, setServings] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showInputForm, setShowInputForm] = useState(true); // New state to toggle between input form and recipe card

  // Cooking Mode State
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  const slideAnim = useRef(new Animated.Value(COLLAPSED_Y)).current;

  // Get current user
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    } else {
      const unsubscribe = getAuth().onAuthStateChanged((user) => {
        setCurrentUserId(user?.uid || null);
      });
      return unsubscribe;
    }
  }, []);

  // --- ANIMATIONS ---
  const panelBgColor = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, COLLAPSED_Y],
    outputRange: [BRAND.bg, "rgba(30, 30, 30, 0.95)"],
    extrapolate: "clamp",
  });

  const borderRadiusAnim = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, EXPANDED_Y + 50],
    outputRange: [0, 35],
    extrapolate: "clamp",
  });

  const contentOpacity = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, COLLAPSED_Y - 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const togglePanel = (open: boolean) => {
    setIsExpanded(open);
    Animated.spring(slideAnim, {
      toValue: open ? EXPANDED_Y : COLLAPSED_Y,
      useNativeDriver: false,
      tension: 40,
      friction: 9,
    }).start();
  };

  const handleReset = () => {
    setSelectedIngredients([]);
    setCuisine(null);
    setMealType(null);
    setPrepTime(null);
    setServings(null);
    setIngredientInput("");
    setCulinaryPrompt("");
    setGeneratedRecipe(null);
    setRecipeImage(null);
    setError(null);
    setCookingMode(false);
    setShowInputForm(true);
  };

  const addIngredient = (name: string) => {
    if (!name.trim()) return;
    const formatted =
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    if (!selectedIngredients.includes(formatted)) {
      setSelectedIngredients([...selectedIngredients, formatted]);
    }
    setIngredientInput("");
  };

  const handleGenerate = async () => {
    setError(null);

    if (selectedIngredients.length === 0 && !culinaryPrompt.trim()) {
      setError(
        "Please add some ingredients or describe what you'd like to cook",
      );
      return;
    }

    setLoading(true);
    setGeneratedRecipe(null);
    setRecipeImage(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/recipes/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          cuisine,
          mealType,
          time: prepTime,
          servings,
          prompt: culinaryPrompt,
          userId: currentUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        } else {
          setError(`Error: ${response.status}`);
          setLoading(false);
          return;
        }
      }

      // Parse the recipe data into structured format
      const lines = data.recipe.split("\n");
      let ingredients = [];
      let instructions = [];
      let chefNote = "";
      let currentSection = null;

      for (const line of lines) {
        if (line.toLowerCase().includes("ingredients:")) {
          currentSection = "ingredients";
          continue;
        } else if (line.toLowerCase().includes("instructions:")) {
          currentSection = "instructions";
          continue;
        } else if (line.toLowerCase().includes("chef's note:")) {
          currentSection = "note";
          continue;
        }

        if (
          currentSection === "ingredients" &&
          line.trim() &&
          !line.includes("Ingredients:")
        ) {
          ingredients.push(line.trim());
        } else if (
          currentSection === "instructions" &&
          line.trim() &&
          !line.includes("Instructions:")
        ) {
          instructions.push(line.trim());
        } else if (currentSection === "note" && line.trim()) {
          chefNote = line.trim();
        }
      }

      setGeneratedRecipe({
        title: data.title,
        ingredients: ingredients,
        instructions: instructions,
        chef_note: chefNote,
        totalTime: prepTime || "Varies",
        servings: servings || "4",
      });
      setRecipeImage(data.image);
      setShowInputForm(false); // Hide input form, show recipe card
    } catch (error: any) {
      if (__DEV__) {
        console.log("Error caught:", error.message);
      }
      setError(error.message || "Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to go back to input form with all data preserved
  const handleBackToInput = () => {
    setShowInputForm(true);
    setError(null);
    // Scroll to top when going back
    // The scroll position will be handled by the ScrollView ref if needed
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe || !generatedRecipe.title) {
      setError("No recipe to save");
      return;
    }

    if (!currentUserId) {
      setError("Please log in to save recipes");
      return;
    }

    // Format the recipe text for saving
    const recipeText = `${generatedRecipe.title}\n\nIngredients:\n${generatedRecipe.ingredients.join("\n")}\n\nInstructions:\n${generatedRecipe.instructions.join("\n")}\n\nChef's Note: ${generatedRecipe.chef_note || "Enjoy your meal!"}`;

    setSaveLoading(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/recipes/save-generated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe: recipeText,
          image: recipeImage,
          title: generatedRecipe.title,
          userId: currentUserId,
          cuisine: cuisine,
          mealType: mealType,
          servings: servings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save recipe");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to save recipe");
    } finally {
      setSaveLoading(false);
    }
  };

  // Cooking Mode Functions
  const handleStartCooking = () => {
    setCurrentStepIndex(0);
    setCookingMode(true);
  };

  const handleNextStep = () => {
    if (
      generatedRecipe &&
      generatedRecipe.instructions &&
      currentStepIndex < generatedRecipe.instructions.length - 1
    ) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished all steps
      setCookingMode(false);
      setCurrentStepIndex(0);
    }
  };

  const closeCookingMode = () => {
    setCookingMode(false);
    setCurrentStepIndex(0);
  };

  const handleTriggerTimer = (seconds: number) => {
    setActiveTimerSeconds(seconds);
    setShowTimerModal(true);
  };

  const handleCompleteRecipe = async () => {
    try {
      const currentUserUid = getAuth().currentUser?.uid;
      if (currentUserUid) {
        await axios.put(
          `${API_URL}/api/users/complete-recipe/${currentUserUid}`,
        );
        console.log("Recipe completed! Cook count incremented.");
      }
      setCookingMode(false);
      setCurrentStepIndex(0);
    } catch (err) {
      console.error("Failed to update cook count", err);
      setCookingMode(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        (isExpanded && gestureState.dy > 5) ||
        (!isExpanded && gestureState.dy < -5),
      onPanResponderMove: (_, gestureState) => {
        const newY = isExpanded
          ? EXPANDED_Y + gestureState.dy
          : COLLAPSED_Y + gestureState.dy;
        if (newY >= EXPANDED_Y) slideAnim.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isExpanded) {
          if (gestureState.dy > 120) togglePanel(false);
          else togglePanel(true);
        } else {
          if (gestureState.dy < -50) togglePanel(true);
          else togglePanel(false);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Video
        source={require("../../assets/videos/generate.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.3)" },
        ]}
      />

      {/* BACK BUTTON (Visible only when panel is collapsed) */}
      {!isExpanded && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Ionicons name="arrow-back" size={24} color={BRAND.accent} />
        </TouchableOpacity>
      )}

      <Animated.View
        style={[
          styles.slidingPanel,
          {
            height: height,
            transform: [{ translateY: slideAnim }],
            backgroundColor: panelBgColor,
            borderTopLeftRadius: borderRadiusAnim,
            borderTopRightRadius: borderRadiusAnim,
          },
        ]}
      >
        {!isExpanded && (
          <View style={styles.peekButtonWrapper}>
            <TouchableOpacity
              style={styles.peekButton}
              onPress={() => togglePanel(true)}
              activeOpacity={0.9}
            >
              <View style={styles.flexRow}>
                <Ionicons name="sparkles" size={20} color={BRAND.bg} />
                <Text style={styles.peekTitle}>Generate Recipes</Text>
              </View>
              <Ionicons name="chevron-up" size={20} color={BRAND.bg} />
            </TouchableOpacity>
          </View>
        )}

        <Animated.View
          style={{ flex: 1, opacity: contentOpacity }}
          pointerEvents={isExpanded ? "auto" : "none"}
        >
          <View {...panResponder.panHandlers} style={styles.headerArea}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => togglePanel(false)}>
                <Ionicons name="close" size={28} color={BRAND.textMain} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>RECIPE BUILDER</Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>RESET</Text>
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Input Form */}
              {showInputForm && !loading && (
                <>
                  <Text style={styles.label}>Ingredients</Text>
                  <View style={styles.ingredientDisplayArea}>
                    {selectedIngredients.length === 0 ? (
                      <Text style={styles.emptyText}>
                        No ingredients added yet...
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {selectedIngredients.map((item) => (
                          <TouchableOpacity
                            key={item}
                            style={styles.chip}
                            onPress={() =>
                              setSelectedIngredients(
                                selectedIngredients.filter((i) => i !== item),
                              )
                            }
                          >
                            <Text style={styles.chipText}>{item}</Text>
                            <Ionicons
                              name="close-circle"
                              size={14}
                              color={BRAND.bg}
                              style={{ marginLeft: 6 }}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  <View style={styles.searchBarWrapper}>
                    <Ionicons name="search" size={20} color={BRAND.accent} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Type an ingredient..."
                      placeholderTextColor="#666"
                      value={ingredientInput}
                      onChangeText={setIngredientInput}
                      onSubmitEditing={() => addIngredient(ingredientInput)}
                    />
                  </View>

                  <Text style={styles.label}>Quick Add</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickAddScroll}
                  >
                    {QUICK_ADDS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.quickAddBtn}
                        onPress={() => addIngredient(item)}
                      >
                        <Ionicons name="add" size={14} color={BRAND.accent} />
                        <Text style={styles.quickAddText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>
                    Are you making something specific? (Optional)
                  </Text>
                  <View style={styles.descriptionWrapper}>
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="e.g. 'Make a low fat chocolate cake..."
                      placeholderTextColor="#555"
                      multiline
                      value={culinaryPrompt}
                      onChangeText={setCulinaryPrompt}
                    />
                  </View>

                  <View style={styles.divider} />

                  <FilterRow
                    title="Cuisine"
                    icon="restaurant-outline"
                    data={CUISINES}
                    selected={cuisine}
                    onSelect={setCuisine}
                  />
                  <FilterRow
                    title="Meal Type"
                    icon="cafe-outline"
                    data={MEAL_TYPES}
                    selected={mealType}
                    onSelect={setMealType}
                  />
                  <FilterRow
                    title="Prep Time"
                    icon="timer-outline"
                    data={TIMES}
                    selected={prepTime}
                    onSelect={setPrepTime}
                  />
                  <FilterRow
                    title="Servings"
                    icon="people-outline"
                    data={SERVINGS}
                    selected={servings}
                    onSelect={setServings}
                  />

                  <TouchableOpacity
                    style={styles.generateBtn}
                    onPress={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={BRAND.bg} />
                    ) : (
                      <>
                        <Ionicons
                          name="flash"
                          size={20}
                          color={BRAND.bg}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.generateBtnText}>
                          CREATE MY MENU
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Loading State */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={BRAND.accent} />
                  <Text style={styles.loadingText}>
                    Creating your recipe...
                  </Text>
                </View>
              )}

              {/* Generated Recipe Card - Styled like [id].tsx */}
              {generatedRecipe && !loading && !showInputForm && (
                <View style={styles.recipeCardContainer}>
                  {/* Back Button to Input Form */}
                  <TouchableOpacity
                    style={styles.backToInputButton}
                    onPress={handleBackToInput}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={BRAND.accent}
                    />
                    <Text style={styles.backToInputText}>Edit Ingredients</Text>
                  </TouchableOpacity>

                  <View style={styles.imageWrapper}>
                    {recipeImage &&
                    recipeImage !== "QUOTA_EXCEEDED" &&
                    recipeImage !== "ERROR" ? (
                      <Image
                        source={{ uri: recipeImage }}
                        style={styles.headerImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.headerImage,
                          {
                            backgroundColor: "#1A1A1A",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Ionicons
                          name="restaurant-outline"
                          size={60}
                          color={BRAND.border}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.contentSection}>
                    <Text style={styles.title}>{generatedRecipe.title}</Text>

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={BRAND.accent}
                        />
                        <Text style={styles.statText}>
                          {generatedRecipe.totalTime || "N/A"}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons
                          name="restaurant-outline"
                          size={20}
                          color={BRAND.accent}
                        />
                        <Text style={styles.statText}>
                          {generatedRecipe.servings
                            ? `${generatedRecipe.servings} Servings`
                            : "General"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.startCookingButton}
                      onPress={handleStartCooking}
                    >
                      <Ionicons
                        name="play-circle"
                        size={24}
                        color="#000"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.startCookingText}>Start Cooking</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {generatedRecipe.ingredients.map(
                      (ing: string, index: number) => (
                        <View key={index} style={styles.listItemRow}>
                          <View style={styles.bullet} />
                          <Text style={styles.listItem}>{ing}</Text>
                        </View>
                      ),
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {generatedRecipe.instructions.map(
                      (step: string, index: number) => {
                        const timings = extractAllTimings(step);
                        return (
                          <View key={index} style={styles.stepContainerMain}>
                            <View style={{ flexDirection: "row", flex: 1 }}>
                              <Text style={styles.stepNumber}>{index + 1}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.listItem}>{step}</Text>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  {timings.map((seconds, tIdx) => (
                                    <TouchableOpacity
                                      key={tIdx}
                                      style={styles.inlineTimerButton}
                                      onPress={() =>
                                        handleTriggerTimer(seconds)
                                      }
                                    >
                                      <Ionicons
                                        name="timer-outline"
                                        size={14}
                                        color="#FFFFFF"
                                      />
                                      <Text style={styles.inlineTimerText}>
                                        {formatDisplayTime(seconds)}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      },
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        saveSuccess && styles.saveButtonSuccess,
                        !currentUserId && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSaveRecipe}
                      disabled={saveLoading || !currentUserId}
                    >
                      {saveLoading ? (
                        <ActivityIndicator color={BRAND.bg} size="small" />
                      ) : saveSuccess ? (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={BRAND.bg}
                          />
                          <Text style={styles.saveButtonText}>
                            Saved to My Recipes!
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="bookmark"
                            size={20}
                            color={BRAND.bg}
                          />
                          <Text style={styles.saveButtonText}>
                            {currentUserId
                              ? "Save to My Recipes"
                              : "Login to Save"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {!currentUserId && (
                      <Text style={styles.loginPromptText}>
                        Please log in to save recipes to your collection
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.newRecipeButton}
                      onPress={handleReset}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={BRAND.accent}
                      />
                      <Text style={styles.newRecipeText}>
                        Create Another Recipe
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#FF5252" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>

      {/* Cooking Mode Modal */}
      <Modal
        visible={cookingMode}
        animationType="slide"
        transparent={false}
        onRequestClose={closeCookingMode}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeCookingMode}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#D4AF37" />
            </TouchableOpacity>

            {generatedRecipe?.instructions &&
              currentStepIndex < generatedRecipe.instructions.length && (
                <Text style={styles.stepProgress}>
                  Step {currentStepIndex + 1} of{" "}
                  {generatedRecipe.instructions.length}
                </Text>
              )}
          </View>

          <View style={styles.modalContent}>
            {generatedRecipe?.instructions &&
            currentStepIndex < generatedRecipe.instructions.length ? (
              <View style={styles.stepCard}>
                <Text style={styles.stepBigNumber}>{currentStepIndex + 1}</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.stepScrollContent}
                >
                  <Text style={styles.stepText}>
                    {generatedRecipe.instructions[currentStepIndex]}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    {extractAllTimings(
                      generatedRecipe.instructions[currentStepIndex],
                    ).map((seconds, tIdx) => (
                      <TouchableOpacity
                        key={tIdx}
                        style={styles.modalTimerButton}
                        onPress={() => handleTriggerTimer(seconds)}
                      >
                        <Ionicons
                          name="timer-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                        <Text style={styles.modalTimerText}>
                          Start {formatDisplayTime(seconds)} Timer
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.nextStepButton}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextStepText}>
                    {currentStepIndex ===
                    generatedRecipe.instructions.length - 1
                      ? "Finish Cooking"
                      : "Next Step"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.completedContainer}>
                <ConfettiCannon
                  count={200}
                  origin={{ x: -10, y: 0 }}
                  fallSpeed={2500}
                  fadeOut={true}
                />

                <View style={styles.mascotContainer}>
                  <Image
                    source={require("../../assets/images/mascot.png")}
                    style={styles.mascotImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.completedTitle}>Yum!</Text>

                <Text style={styles.completedSub}>
                  You just cooked{" "}
                  <Text style={{ fontWeight: "bold", color: "#D4AF37" }}>
                    {generatedRecipe?.title}
                  </Text>
                  !
                </Text>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCompleteRecipe}
                >
                  <Text style={styles.doneButtonText}>Complete Recipe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Timer Logic Overlay */}
      <Modal visible={showTimerModal} animationType="fade" transparent={false}>
        <Timer
          initialSeconds={activeTimerSeconds}
          onClose={() => setShowTimerModal(false)}
        />
      </Modal>
    </View>
  );
}

// FilterRow component
const FilterRow = ({ title, icon, data, selected, onSelect }: any) => (
  <View style={styles.filterRowContainer}>
    <View style={styles.filterHeader}>
      <Ionicons name={icon} size={16} color={BRAND.accent} />
      <Text style={styles.filterTitle}>{title}</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingRight: 20 }}
    >
      {data.map((item: string) => (
        <TouchableOpacity
          key={item}
          onPress={() => onSelect(selected === item ? null : item)}
          style={[
            styles.filterTag,
            selected === item && styles.filterTagActive,
          ]}
        >
          <Text
            style={[
              styles.filterTagText,
              selected === item && styles.filterTagTextActive,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.bg },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(30, 30, 30, 0.7)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BRAND.accent,
  },
  slidingPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  peekButtonWrapper: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  peekButton: {
    backgroundColor: BRAND.accent,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    width: "75%",
  },
  peekTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: BRAND.bg,
    marginLeft: 10,
  },
  flexRow: { flexDirection: "row", alignItems: "center" },
  headerArea: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: BRAND.border,
    borderRadius: 2,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: BRAND.textMain,
    letterSpacing: 2,
  },
  resetText: { color: BRAND.accent, fontWeight: "900", fontSize: 12 },
  scrollBody: {
    paddingHorizontal: 20, // Changed from 10 to 20 for consistent horizontal padding
    paddingBottom: 100,
  },
  ingredientDisplayArea: {
    height: 50,
    marginBottom: 10,
    justifyContent: "center",
  },
  emptyText: { color: BRAND.textMuted, fontSize: 14, fontStyle: "italic" },
  chip: {
    backgroundColor: BRAND.accent,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "800", color: BRAND.bg },
  searchBarWrapper: {
    backgroundColor: BRAND.inputBg,
    borderRadius: 18,
    paddingLeft: 15,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: BRAND.textMain,
    marginLeft: 10,
    marginRight: 15,
  }, // Added right margin
  descriptionWrapper: {
    backgroundColor: BRAND.inputBg,
    borderRadius: 18,
    padding: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: BRAND.accent,
    borderStyle: "dashed",
    marginBottom: 25,
  },
  descriptionInput: { flex: 1, fontSize: 15, color: BRAND.textMain },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: BRAND.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1.5,
    // paddingHorizontal removed - now handled by scrollBody
  },
  quickAddScroll: { marginBottom: 25 /* paddingHorizontal removed */ },
  quickAddBtn: {
    backgroundColor: BRAND.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  quickAddText: { fontWeight: "700", color: BRAND.textMain, marginLeft: 5 },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 20 },
  filterRowContainer: { marginBottom: 30 /* paddingHorizontal removed */ },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  filterTitle: { fontSize: 16, fontWeight: "800", color: BRAND.textMain },
  filterTag: {
    backgroundColor: BRAND.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  filterTagActive: { backgroundColor: BRAND.accent, borderColor: BRAND.accent },
  filterTagText: { color: BRAND.textMuted, fontWeight: "700", fontSize: 14 },
  filterTagTextActive: { color: BRAND.bg },
  generateBtn: {
    backgroundColor: BRAND.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20, // Added bottom margin
    // marginHorizontal removed - now handled by scrollBody
  },
  generateBtnText: {
    color: BRAND.bg,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: BRAND.textMain,
    marginTop: 15,
    fontSize: 16,
  },
  recipeCardContainer: {
    marginTop: 0,
    marginBottom: 30,
  },
  backToInputButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backToInputText: {
    color: BRAND.accent,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  imageWrapper: { width: "100%", height: 300, position: "relative" },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  contentSection: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#000000",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 24,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  statItem: { flexDirection: "row", alignItems: "center", marginRight: 24 },
  statText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#D4AF37",
    marginBottom: 12,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D4AF37",
    marginTop: 8,
    marginRight: 10,
  },
  listItem: { fontSize: 16, color: "#BBBBBB", lineHeight: 24, flex: 1 },
  stepContainerMain: { marginBottom: 16 },
  stepNumber: {
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#D4AF37",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  },
  startCookingButton: {
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  startCookingText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  inlineTimerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8C00",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  inlineTimerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: BRAND.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonSuccess: {
    backgroundColor: "#4CAF50",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: BRAND.bg,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginPromptText: {
    color: BRAND.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  newRecipeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 15,
    gap: 8,
  },
  newRecipeText: {
    color: BRAND.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
    // marginHorizontal removed - now handled by scrollBody
    borderWidth: 1,
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    marginRight: 10,
  },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: "#000000" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: { padding: 10 },
  stepProgress: { fontSize: 16, fontWeight: "600", color: "#BBBBBB" },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: "center",
  },
  stepCard: {
    backgroundColor: "#121212",
    borderRadius: 30,
    padding: 30,
    height: "80%",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#333333",
  },
  stepBigNumber: {
    fontSize: 240,
    fontWeight: "bold",
    color: "rgba(212, 175, 55, 0.08)",
    position: "absolute",
    top: 80,
    zIndex: -1,
  },
  stepScrollContent: { flexGrow: 1, justifyContent: "center" },
  stepText: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 36,
    fontWeight: "500",
    marginBottom: 20,
  },
  nextStepButton: {
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    justifyContent: "center",
  },
  nextStepText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  modalTimerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8C00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  modalTimerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotContainer: {
    width: 250,
    height: 250,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImage: { width: "100%", height: "100%" },
  completedTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#D4AF37",
    marginBottom: 10,
  },
  completedSub: {
    fontSize: 18,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 30,
  },
  doneButton: {
    backgroundColor: "#FF8C00",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  doneButtonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
