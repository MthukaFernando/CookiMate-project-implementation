import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyle } from "../globalStyleSheet.style";

const TAB_BAR_HEIGHT = 65;
const PEEK_HEIGHT = 125;

const QUICK_ADDS = ["Beef", "Pasta", "Onion", "Garlic", "Chicken", "Shrimp"];

const CUISINES = [
  "American",
  "Asian",
  "British",
  "Caribbean",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Louisiana",
  "Mediterranean",
  "Mexican",
  "New-Orleans",
  "South-American",
  "Sri Lankan",
  "Swiss",
  "Texan",
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
  const { height } = useWindowDimensions();

  const TOP_MARGIN = 96;
  const COLLAPSED_Y = height - PEEK_HEIGHT - TAB_BAR_HEIGHT;
  const EXPANDED_Y = TOP_MARGIN;

  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState<string | null>(null);
  const [servings, setServings] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(COLLAPSED_Y)).current;

  // --- NEW: Animate Border Radius ---
  // When at TOP (Expanded): Radius is 0 (Square)
  // When at BOTTOM (Collapsed): Radius is 35 (Rounded)
  const panelBorderRadius = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, COLLAPSED_Y],
    outputRange: [0, 35],
    extrapolate: "clamp",
  });

  // Fade out content as we collapse
  const contentOpacity = slideAnim.interpolate({
    inputRange: [EXPANDED_Y, EXPANDED_Y + 150],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Fade in peek button as we collapse
  const peekOpacity = slideAnim.interpolate({
    inputRange: [COLLAPSED_Y - 100, COLLAPSED_Y],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const togglePanel = (open: boolean) => {
    setIsExpanded(open);
    Animated.spring(slideAnim, {
      toValue: open ? EXPANDED_Y : COLLAPSED_Y,
      useNativeDriver: false, // Must be false to animate layout properties like borderRadius
      tension: 40,
      friction: 8,
    }).start();
  };

  const handleReset = () => {
    setSelectedIngredients([]);
    setCuisine(null);
    setMealType(null);
    setPrepTime(null);
    setServings(null);
    setIngredientInput("");
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        isExpanded && gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        const newY = EXPANDED_Y + gestureState.dy;
        if (newY >= EXPANDED_Y) slideAnim.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) togglePanel(false);
        else togglePanel(true);
      },
    }),
  ).current;

  const addIngredient = (name: string) => {
    if (!name.trim()) return;
    const formatted =
      name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    if (!selectedIngredients.includes(formatted)) {
      setSelectedIngredients([...selectedIngredients, formatted]);
    }
    setIngredientInput("");
  };

  return (
    <View style={[styles.container, globalStyle?.container]}>
      <ImageBackground
        source={require("../../assets/images/generate.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {isExpanded && (
        <Pressable style={styles.backdrop} onPress={() => togglePanel(false)} />
      )}

      <Animated.View
        style={[
          styles.slidingPanel,
          {
            height: height - TOP_MARGIN,
            transform: [{ translateY: slideAnim }],
            // Apply the animated border radius here
            borderTopLeftRadius: panelBorderRadius,
            borderTopRightRadius: panelBorderRadius,
          },
        ]}
      >
        {/* --- PEEK BUTTON SECTION --- */}
        <Animated.View
          style={[styles.peekButtonWrapper, { opacity: peekOpacity }]}
        >
          <TouchableOpacity
            style={styles.peekButton}
            onPress={() => togglePanel(true)}
            activeOpacity={0.9}
            disabled={isExpanded}
          >
            <View style={styles.flexRow}>
              <Ionicons name="sparkles" size={20} color="#4A3B2C" />
              <Text style={styles.peekTitle}>Generate Recipes</Text>
            </View>
            <Ionicons name="chevron-up" size={20} color="#4A3B2C" />
          </TouchableOpacity>
        </Animated.View>

        {/* --- EXPANDED CONTENT SECTION --- */}
        <Animated.View
          style={{ flex: 1, opacity: contentOpacity, marginTop: 10 }}
          pointerEvents={isExpanded ? "auto" : "none"}
        >
          <View {...panResponder.panHandlers} style={styles.headerArea}>
            <View style={styles.dragHandle} />
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => togglePanel(false)} hitSlop={20}>
                <Ionicons name="close" size={26} color="#9CA3AF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Recipe Builder</Text>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.resetContainer}
                hitSlop={20}
              >
                <Text style={styles.resetText}>Reset</Text>
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
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.searchSection}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#9CA3AF"
                  style={{ marginRight: 10 }}
                />
                <View style={styles.chipContainer}>
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
                      <Text style={styles.chipText}>{item} ✕</Text>
                    </TouchableOpacity>
                  ))}
                  <TextInput
                    style={styles.textInput}
                    placeholder="Add ingredients..."
                    value={ingredientInput}
                    onChangeText={setIngredientInput}
                    onSubmitEditing={() => addIngredient(ingredientInput)}
                  />
                </View>
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
                    <Ionicons name="add" size={14} color="#4A3B2C" />
                    <Text style={styles.quickAddText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
                activeOpacity={0.8}
                onPress={() => {
                  console.log("Generating...");
                  togglePanel(false);
                }}
              >
                <Ionicons
                  name="flash"
                  size={18}
                  color="#4A3B2C"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.generateBtnText}>Create My Menu</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const FilterRow = ({ title, icon, data, selected, onSelect }: any) => (
  <View style={styles.filterRowContainer}>
    <View style={styles.filterHeader}>
      <Ionicons name={icon} size={16} color="#4A3B2C" />
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
  container: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 9998,
  },
  slidingPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8F4EF",
    zIndex: 9999,
  },
  peekButtonWrapper: {
    position: "absolute",
    top: 0,
    height: PEEK_HEIGHT,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  peekButton: {
    backgroundColor: "#EBC390",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 25,
    marginBottom: 45,
    borderRadius: 50,
    width: "88%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  flexRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  peekTitle: { fontSize: 17, fontWeight: "bold", color: "#4A3B2C" },
  headerArea: {
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: "center",
  },
  dragHandle: {
    width: 45,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#4A3B2C" },
  resetContainer: { padding: 5 },
  resetText: { color: "#B45309", fontWeight: "800", fontSize: 15 },
  scrollBody: { paddingHorizontal: 20, paddingBottom: 120 },
  searchSection: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", flex: 1, gap: 5 },
  chip: {
    backgroundColor: "#F3D8B6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: "#4A3B2C" },
  textInput: { flex: 1, minWidth: 100, fontSize: 16 },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingLeft: 5,
  },
  quickAddScroll: { marginBottom: 35 },
  quickAddBtn: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickAddText: { fontWeight: "600", color: "#4A3B2C" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 35 },
  filterRowContainer: { marginBottom: 35 },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: { fontSize: 17, fontWeight: "800", color: "#4A3B2C" },
  filterTag: {
    backgroundColor: "#FFF",
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  filterTagActive: { backgroundColor: "#4A3B2C", borderColor: "#4A3B2C" },
  filterTagText: { color: "#6B7280", fontWeight: "700", fontSize: 14 },
  filterTagTextActive: { color: "#FFF" },
  generateBtn: {
    backgroundColor: "#EBC390",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 22,
    marginTop: 10,
  },
  generateBtnText: { color: "#4A3B2C", fontSize: 18, fontWeight: "900" },
});
