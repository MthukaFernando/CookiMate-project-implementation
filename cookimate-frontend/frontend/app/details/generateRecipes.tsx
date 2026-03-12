import React, { useState, useRef } from "react";
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
  Pressable,
  StatusBar,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- DARK BRANDING COLORS ---
const BRAND = {
  bg: "#121212",
  surface: "#1E1E1E",
  accent: "#FFB300",
  textMain: "#FFFFFF",
  textMuted: "#A0A0A0",
  inputBg: "#2A2A2A",
  border: "#333333",
};

// ... (Keep your DATA ARRAYS: QUICK_ADDS, CUISINES, etc. here) ...
const QUICK_ADDS = ["Beef", "Pasta", "Onion", "Garlic", "Chicken", "Shrimp"];
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

export default function GenerateRecipesPage() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  // --- ADJUSTED CONSTANTS FOR FULL SCREEN ---
  const TAB_BAR_HEIGHT = 65;
  const PEEK_HEIGHT = 180;
  const EXPANDED_Y = 0; // No margin at the top
  const COLLAPSED_Y = height - PEEK_HEIGHT - TAB_BAR_HEIGHT;

  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [culinaryPrompt, setCulinaryPrompt] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState<string | null>(null);
  const [servings, setServings] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(COLLAPSED_Y)).current;

  // --- ANIMATIONS ---
  const panelBgColor = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, COLLAPSED_Y],
    outputRange: [BRAND.bg, "rgba(30, 30, 30, 0.95)"],
    extrapolate: "clamp",
  });

  const borderRadiusAnim = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, EXPANDED_Y + 50],
    outputRange: [0, 35], // Flatten corners when it hits the top
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
            height: height, // Panel now matches screen height
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
          {/* Header area remains draggable to close */}
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
              <Text style={styles.label}>Ingredients</Text>
              <View style={styles.ingredientDisplayArea}>
                {selectedIngredients.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No ingredients added yet...
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

              <Text style={styles.label}>What are we making?</Text>
              <View style={styles.descriptionWrapper}>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="e.g. 'Make a ribbon cake'..."
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

              <TouchableOpacity style={styles.generateBtn}>
                <Ionicons
                  name="flash"
                  size={20}
                  color={BRAND.bg}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.generateBtnText}>CREATE MY MENU</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ... (FilterRow component stays same as your original) ...
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
    // Radius is now animated via borderRadiusAnim
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
  scrollBody: { paddingHorizontal: 25, paddingBottom: 60 },
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
  textInput: { flex: 1, fontSize: 16, color: BRAND.textMain, marginLeft: 10 },
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
  },
  quickAddScroll: { marginBottom: 25 },
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
  divider: { height: 1, backgroundColor: BRAND.border, marginBottom: 35 },
  filterRowContainer: { marginBottom: 30 },
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
  },
  generateBtnText: {
    color: BRAND.bg,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
