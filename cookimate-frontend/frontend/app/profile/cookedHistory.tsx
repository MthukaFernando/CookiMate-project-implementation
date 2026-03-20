import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.25;

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const CookedHistoryPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCookedHistory = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      // We assume your backend returns the user object with populated recipe details
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      
      // Map the cookedHistory array to just the recipe data
      // Adjust this based on how your backend sends the data
      const history = response.data.cookedHistory.map((item: any) => ({
        ...item.recipeId, // Spread recipe details
        dateCooked: item.dateCooked, // Keep the date for display
      }));

      setRecipes(history);
    } catch (error) {
      console.error("Error fetching cooked history:", error);
    } finally {
      setLoading(false);
    }
  };
}