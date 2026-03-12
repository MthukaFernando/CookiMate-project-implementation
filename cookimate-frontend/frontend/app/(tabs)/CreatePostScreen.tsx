import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy"; // Fix for SDK 54
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";

const CreatePostScreen: React.FC = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // --- Dynamic IP Detection for Backend ---
  const debuggerHost = Constants.expoConfig?.hostUri;
  const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
  const API_URL = `http://${address}:5000`;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is needed to post.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // Using string literal instead of Enum to fix the 'Property does not exist' error
      mediaTypes: 'images', 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to share a post.");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      // 1. Convert to Base64 using the legacy API to bypass SDK 54 errors
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: "base64",
      });

      const base64Image = `data:image/jpeg;base64,${base64}`;

      // 2. Prepare JSON Payload
      const payload = {
        user: currentUser.uid,
        caption: caption,
        image: base64Image,
      };

      // 3. Execute Request
      const response = await axios.post(`${API_URL}/api/social`, payload);

      if (response.status === 201) {
        Alert.alert(
          "Success!",
          "Post shared! +10 Points added to your profile.",
        );
        setImage(null);
        setCaption("");
      }
    } catch (error: any) {
      console.log("--- UPLOAD ERROR ---");
      console.log(error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message || "Server error. Check your connection.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- FIX: The return statement must be here inside the main component function ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Share Your Cooking</Text>

        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Tap to select a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          placeholder="What's the secret ingredient?..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        <TouchableOpacity
          style={[styles.postButton, loading && styles.disabledButton]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post to Feed</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Posting as: {auth.currentUser?.email || "Unknown User"}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 40,
  },
  imageBox: {
    width: "100%",
    height: 300,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  placeholderContainer: { alignItems: "center" },
  previewImage: { width: "100%", height: "100%" },
  placeholderText: { color: "#999" },
  captionInput: {
    width: "100%",
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: "top",
    color: "#333",
  },
  postButton: {
    backgroundColor: "#FF6347",
    width: "100%",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#ccc" },
  postButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footerText: { marginTop: 20, fontSize: 12, color: "#bbb" },
});

export default CreatePostScreen;