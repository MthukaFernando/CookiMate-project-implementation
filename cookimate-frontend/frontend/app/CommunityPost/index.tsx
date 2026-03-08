import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");

export default function CommunityUploadPost() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // OPTION 1: Pick from Gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "Permission Needed",
        "We need gallery access to share your recipes.",
      );

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // OPTION 2: Take New Photo (Camera)
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "Permission Needed",
        "We need camera access to snap your creation!",
      );

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // SIMULATED SHARE (Frontend Only for now)
  const handleShare = () => {
    if (!image)
      return Alert.alert("Chef!", "Don't forget the photo of your dish!");
    if (!caption.trim())
      return Alert.alert("Recipe thoughts?", "Tell us what you cooked!");

    setIsUploading(true);

    // Simulated "Upload" delay so you can see the loading state
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        "Compliments to the Chef!",
        "Frontend is ready! (Backend connection skipped as requested)",
        [
          {
            text: "Great!",
            onPress: () => router.replace("/Community/CommunityFeed"),
          },
        ],
      );
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close-outline" size={30} color="#522F2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share your Dish</Text>
        <TouchableOpacity
          onPress={handleShare}
          disabled={isUploading || !image}
          style={[
            styles.shareBtn,
            (!image || isUploading) && styles.disabledBtn,
          ]}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.shareBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* PHOTO SECTION */}
        <View style={styles.imageSection}>
          {image ? (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <View style={styles.editControls}>
                <TouchableOpacity style={styles.miniBtn} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.miniBtn} onPress={pickImage}>
                  <Ionicons name="images" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.selectorContainer}>
              
              <Text style={styles.selectorTitle}>Select a image</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.selectorBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, { backgroundColor: "#B86D2A" }]}
                  onPress={pickImage}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.selectorBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* CAPTION SECTION */}
        <View style={styles.inputWrapper}>
          <View style={styles.userRow}>
            <Image
              source={{
                uri:
                  auth.currentUser?.photoURL ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.userAvatar}
            />
            <Text style={styles.username}>Caption</Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="Tell us about the recipe, the taste, or your cooking process..."
            placeholderTextColor="#A0A0A0"
            multiline
            maxLength={300}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={styles.charCount}>{caption.length}/300</Text>
        </View>
      </ScrollView>

      {/* LOADING OVERLAY */}
      {isUploading && (
        <View style={styles.overlay}>
          <View style={styles.loaderCard}>
            <MaterialCommunityIcons
              name="pot-steam"
              size={50}
              color="#B86D2A"
            />
            <Text style={styles.loaderText}>Serving your post...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F2ECE2",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#522F2F" },
  closeBtn: { padding: 5 },
  shareBtn: {
    backgroundColor: "#B86D2A",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 12,
  },
  disabledBtn: { backgroundColor: "#E0C8B0" },
  shareBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  scrollContent: { paddingBottom: 40 },
  imageSection: { width: width, height: width, backgroundColor: "#FAF7F2" },
  previewWrapper: { width: "100%", height: "100%" },
  previewImage: { width: "100%", height: "100%" },
  editControls: {
    position: "absolute",
    bottom: 15,
    right: 15,
    flexDirection: "row",
    gap: 10,
  },
  miniBtn: {
    backgroundColor: "rgba(82, 47, 47, 0.8)",
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#522F2F",
    marginBottom: 25,
  },
  buttonRow: { flexDirection: "row", gap: 15 },
  selectorBtn: {
    backgroundColor: "#522F2F",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
  },
  selectorBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  inputWrapper: {
    padding: 25,
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -35,
    minHeight: 400,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#B86D2A",
  },
  username: { fontWeight: "700", color: "#522F2F", fontSize: 16 },
  captionInput: {
    fontSize: 16,
    color: "#444",
    minHeight: 150,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  charCount: {
    textAlign: "right",
    color: "#B86D2A",
    fontSize: 12,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(82, 47, 47, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  loaderCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 30,
    alignItems: "center",
    elevation: 10,
  },
  loaderText: {
    marginTop: 15,
    fontWeight: "800",
    color: "#522F2F",
    fontSize: 16,
  },
});
