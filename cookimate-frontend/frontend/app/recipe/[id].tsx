import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context'; 

// REPLACE THIS with your specific laptop IP (Same as in myRecipes.tsx)
// If you set up the .env file, use: process.env.EXPO_PUBLIC_API_URL
const API_URL = 'http://192.168.1.6:5000'; 

export default function RecipeDetails() {
  const { id } = useLocalSearchParams(); // This grabs the ID from the URL
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        console.log(`Fetching recipe: ${API_URL}/api/recipes/${id}`);
        const response = await axios.get(`${API_URL}/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5F4436" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
        <TouchableOpacity style={styles.backButtonFixed} onPress={() => router.back()}>
           <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageWrapper}>
          {recipe.image ? (
             <Image source={{ uri: recipe.image }} style={styles.headerImage} />
          ) : (
             <View style={[styles.headerImage, { backgroundColor: '#ddd' }]} /> // Fallback if no image
          )}
          
          {/* Back Button Floating on Image */}
          <TouchableOpacity style={styles.roundBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#5F4436" />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{recipe.name}</Text>
          
          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#5F4436" />
              <Text style={styles.statText}>{recipe.totalTime || 'N/A'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="restaurant-outline" size={20} color="#5F4436" />
              <Text style={styles.statText}>{recipe.servings ? `${recipe.servings} Servings` : 'General'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {/* Check if ingredients is an array before mapping */}
          {Array.isArray(recipe.ingredients_raw_str) ? (
            recipe.ingredients_raw_str.map((ing: string, index: number) => (
              <View key={index} style={styles.listItemRow}>
                <View style={styles.bullet} />
                <Text style={styles.listItem}>{ing}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listItem}>No ingredients listed.</Text>
          )}

          <View style={styles.divider} />

          {/* Instructions */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          {Array.isArray(recipe.steps) ? (
            recipe.steps.map((step: string, index: number) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.listItem}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listItem}>{recipe.instructions || "No instructions provided."}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2ece2' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2ece2' },
  imageWrapper: { width: '100%', height: 300, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  roundBackButton: {
    position: 'absolute', top: 50, left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.2, shadowRadius:4
  },
  contentSection: {
    flex: 1,
    marginTop: -30, // Pulls the white section up over the image
    backgroundColor: '#f2ece2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 500
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#5F4436', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 24, marginBottom: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#5F4436', fontWeight: '600', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#dccfc6', marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#5F4436', marginBottom: 12 },
  listItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbaacb', marginTop: 8, marginRight: 10 }, // Lilac bullet point
  listItem: { fontSize: 16, color: '#4a4a4a', lineHeight: 24, flex: 1 },
  stepContainer: { flexDirection: 'row', marginBottom: 16 },
  stepNumber: { 
    fontWeight: 'bold', color: '#fff', backgroundColor: '#cbaacb', 
    width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, marginRight: 12 
  },
  errorText: { color: 'red', fontSize: 16, marginBottom: 20 },
  backButtonFixed: { padding: 10, backgroundColor: '#5F4436', borderRadius: 8 },
  backButtonText: { color: 'white' }
});