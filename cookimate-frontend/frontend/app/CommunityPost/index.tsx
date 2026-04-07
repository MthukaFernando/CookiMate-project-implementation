import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy"; // Fix for SDK 54
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router"; // For navigation
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../../config/firebase";

const { width } = Dimensions.get("window");

// Custom Alert Component
const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "OK", 
  cancelText = "Cancel",
  type = "confirm"
}: { 
  visible: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel?: () => void; 
  confirmText?: string; 
  cancelText?: string;
  type?: string;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onCancel || onConfirm}
  >
    <View style={styles.alertOverlay}>
      <View style={styles.alertContainer}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertButtons}>
          {type === "confirm" && onCancel && (
            <TouchableOpacity style={[styles.alertButton, styles.alertCancelButton]} onPress={onCancel}>
              <Text style={styles.alertCancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.alertButton, styles.alertConfirmButton]} onPress={onConfirm}>
            <Text style={styles.alertConfirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const CreatePostScreen: React.FC = () => {
  const router = useRouter();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Custom alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: undefined as (() => void) | undefined,
    confirmText: "OK",
    cancelText: "Cancel",
    type: "confirm" as "confirm" | "alert",
  });

  const showCustomAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = "OK",
    cancelText: string = "Cancel",
    type: "confirm" | "alert" = "confirm"
  ) => {
    setAlertConfig({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      type,
    });
    setAlertVisible(true);
  };

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert("Permission Denied", "Gallery access is needed to post.", () => {}, undefined, "OK", "Cancel", "alert");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
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
      showCustomAlert("Error", "You must be logged in to share a post.", () => {}, undefined, "OK", "Cancel", "alert");
      return;
    }
    if (!image) {
      showCustomAlert("Error", "Please select an image first.", () => {}, undefined, "OK", "Cancel", "alert");
      return;
    }

    setLoading(true);

    try {
      // 1. Create a FormData object (The "Bag" that holds our data)
      const formData = new FormData();
      
      // 2. Prepare the image file for the "Bag"
      // We extract the filename and type from the uri
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: image.uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // 3. Append other text fields
      formData.append("user", currentUser.uid);
      formData.append("caption", caption);

      // 4. Execute Request
      // IMPORTANT: No 'Content-Type' header needed, Axios handles it automatically for FormData
      const response = await axios.post(`${API_URL}/api/social`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        showCustomAlert(
          "Success!", 
          "Post shared! Check your level card to see your progress",
          () => {
            router.replace("/");
          },
          undefined,
          "Great",
          "Cancel",
          "alert"
        );
        setImage(null);
        setCaption("");
      }
    } catch (error: any) {
      console.log("--- UPLOAD ERROR ---");
      // Logging the specific error from the server helps us debug 512MB RAM issues
      console.log(error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || "Server error. Check your connection.";
      showCustomAlert("Upload Failed", errorMessage, () => {}, undefined, "OK", "Cancel", "alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={styles.mainContainer}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.header}>New Post</Text>
            <View style={{ width: 24 }} />
          </View>

          <TouchableOpacity style={styles.imageBox} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons name="camera-plus" size={40} color="#FFD700" />
                <Text style={styles.placeholderText}>Select your dish photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="What's the secret ingredient?..."
              placeholderTextColor="#888"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.postButton, (loading || !image) && styles.disabledButton]}
            onPress={handleUpload}
            disabled={loading || !image}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.postButtonText}>Post to Community</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Posting as: <Text style={{color: '#FFD700'}}>{auth.currentUser?.email || "Unknown"}</Text>
          </Text>
        </ScrollView>

        {/* Full Screen Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Uploading to Kitchen...</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          setAlertVisible(false);
          alertConfig.onConfirm();
        }}
        onCancel={alertConfig.onCancel ? () => {
          setAlertVisible(false);
          if (alertConfig.onCancel) alertConfig.onCancel();
        } : undefined}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        type={alertConfig.type}
      />
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
    marginBottom: 25,
  },
  header: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFD700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  imageBox: {
    width: "100%",
    height: width - 40,
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#FFD700",
    marginTop: 10,
    fontWeight: "600",
    opacity: 0.8,
  },
  inputSection: {
    width: "100%",
    marginBottom: 25,
  },
  inputLabel: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 5,
  },
  captionInput: {
    width: "100%",
    minHeight: 100,
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
    color: "#fff",
    textAlignVertical: "top",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  postButton: {
    backgroundColor: "#FFD700",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#555",
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  footerText: {
    marginTop: 25,
    fontSize: 12,
    color: "#666",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#FFD700",
    marginTop: 15,
    fontWeight: "700",
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 12,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  alertButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  alertConfirmButton: {
    backgroundColor: "#FFD700",
  },
  alertCancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  alertConfirmText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
  alertCancelText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CreatePostScreen;