import React, { useState } from "react";
import { BlurView } from 'expo-blur';
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
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function GenerateRecipesPage() {
  const [isInputModalVisible, setIsInputModalVisible] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  const suggestedIngredients = ["Tomato", "Carrot", "Chicken", "Basil"];

  // --- Logic for Ingredients ---
  const handleAddInput = () => {
    if (ingredientInput.trim().length > 0) {
      if (!selectedIngredients.includes(ingredientInput.trim())) {
        setSelectedIngredients([...selectedIngredients, ingredientInput.trim()]);
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

  const handleFinalGenerate = () => {
    // This is where you would call your API
    console.log("Generating recipes with:", selectedIngredients);
    // For now, we can just close the modal or show a success message
    setIsInputModalVisible(false); 
  };

  return (
    <View style={styles.container}>
      
      {/* 1. LANDING SCREEN (Background + Hero Button) */}
      <ImageBackground 
        source={require("../../assets/images/Home-page-Mascot.jpg")} // Replace with a nice kitchen/food background if you have one
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={3} // Subtle blur on the background image itself
      >
        <View style={styles.overlay}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Ready to Cook?</Text>
            <Text style={styles.heroSubtitle}>Find recipes with what you have.</Text>
            
            <Pressable 
              style={({pressed}) => [styles.heroButton, pressed && styles.btnPressed]}
              onPress={() => setIsInputModalVisible(true)}
            >
              <Text style={styles.heroButtonText}>Start Generating</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>


      {/* 2. INPUT POP-UP (The "Window" that takes up the screen) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isInputModalVisible}
        onRequestClose={() => setIsInputModalVisible(false)}
      >
        {/* Glassmorphism Background */}
        <BlurView intensity={90} tint="light" style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardWrapper}
          >
             
            {/* The "Window" Card */}
            <View style={styles.glassWindow}>
              
              {/* Header with Close Button */}
              <View style={styles.windowHeader}>
                <Text style={styles.windowTitle}>Ingredient Check</Text>
                <Pressable onPress={() => setIsInputModalVisible(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Mascot Section */}
                <View style={styles.mascotSection}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatText}>Tell me what you have in your fridge!</Text>
                  </View>
                  <View style={styles.mascotPlaceholder}>
                    {/* Ensure this path is correct for your project */}
                    <Image 
                      source={require("../../assets/images/Home-page-Mascot.jpg")} 
                      style={styles.mascotImage} 
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Search Bar with Chips */}
                <Text style={styles.inputLabel}>Your Ingredients:</Text>
                <View style={styles.searchContainer}>
                  {selectedIngredients.map((tag, index) => (
                    <Pressable key={index} onPress={() => removeIngredient(index)} style={styles.chip}>
                      <Text style={styles.chipText}>{tag} ✕</Text>
                    </Pressable>
                  ))}
                  <TextInput
                    style={styles.textInput}
                    placeholder={selectedIngredients.length === 0 ? "Type e.g. Onion..." : "Add more..."}
                    placeholderTextColor="#888"
                    value={ingredientInput}
                    onChangeText={setIngredientInput}
                    onSubmitEditing={handleAddInput}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Quick Add Buttons */}
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

                {/* Final Action Button */}
                <Pressable 
                  style={({ pressed }) => [styles.generateActionBtn, pressed && styles.btnPressed]}
                  onPress={handleFinalGenerate}
                >
                  <Text style={styles.generateActionText}>Find Recipes ➔</Text>
                </Pressable>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  /* --- Landing Page Styles --- */
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Darkens the background image slightly
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#EEE',
    marginBottom: 40,
    textAlign: 'center',
  },
  heroButton: {
    backgroundColor: '#EBC390', // Your theme gold/beige
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  heroButtonText: {
    color: '#4A3B2C',
    fontSize: 20,
    fontWeight: 'bold',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  /* --- Modal (Input Window) Styles --- */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassWindow: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // High opacity for readability
    borderRadius: 30,
    padding: 20,
    // Glass borders
    borderWidth: 1,
    borderColor: '#FFF',
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  windowTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: '#888',
    fontWeight: 'bold',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },

  /* --- Inner Content --- */
  mascotSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chatBubble: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  chatText: {
    color: '#5D4037',
    fontSize: 16,
    textAlign: 'center',
  },
  mascotPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },

  /* Input Fields */
  inputLabel: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 8,
    color: '#555',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFF',
    width: '100%',
    minHeight: 55,
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBCFB0',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#2D8A4E', // Green chips
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginVertical: 4,
  },
  chipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
    paddingVertical: 5,
  },

  /* Suggestion Buttons */
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'center',
  },
  suggestionBtn: {
    backgroundColor: '#F5EFE6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DBCFB0',
  },
  suggestionText: {
    color: '#5D4037',
    fontWeight: '600',
  },

  /* Final Action Button */
  generateActionBtn: {
    backgroundColor: '#C4734D', // Terra cotta
    width: '100%',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#C4734D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  generateActionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});