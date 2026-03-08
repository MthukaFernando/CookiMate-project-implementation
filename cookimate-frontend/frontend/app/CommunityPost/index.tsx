import React, { useState } from 'react';
import { 
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, 
  ScrollView, Dimensions 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { auth } from "../../config/firebase"; // Verified path
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// BACKEND CONFIG
const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const BASE_URL = `http://${address}:5000/api`;

// CLOUDINARY CONFIG - Replace with your actual details
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload";
const UPLOAD_PRESET = "YOUR_UNSIGNED_PRESET";

export default function CommunityUploadPost() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need gallery access to post photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    if (!image) return Alert.alert("Wait!", "Please select a photo first.");
    if (!caption.trim()) return Alert.alert("Caption needed", "Share a thought about your post.");

    setIsUploading(true);

    try {
      // 1. UPLOAD TO CLOUDINARY
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const cloudRes = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      
      if (!cloudData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      // 2. SAVE URL TO MONGODB
      await axios.post(`${BASE_URL}/social/create`, {
        user: auth.currentUser?.uid,
        imageUrl: cloudData.secure_url, // URL from Cloudinary
        caption: caption.trim(),
      });

      Alert.alert("Success!", "Post shared to the community.");
      router.replace('/Community/CommunityFeed'); // Navigate back to feed
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Could not upload post. Check your connection or Cloudinary settings.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity 
          onPress={handleShare} 
          disabled={isUploading || !image}
          style={[styles.shareBtn, (!image || isUploading) && styles.disabledBtn]}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.shareBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* PHOTO SELECTOR */}
        <View style={styles.imageContainer}>
          {image ? (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                <Ionicons name="camera-reverse" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
              <View style={styles.iconCircle}>
                <Ionicons name="image-outline" size={40} color="#FF6B6B" />
              </View>
              <Text style={styles.placeholderMainText}>Select a Photo</Text>
              <Text style={styles.placeholderSubText}>Square (1:1) is recommended</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CAPTION BOX */}
        <View style={styles.inputWrapper}>
          <View style={styles.userRow}>
             <Image 
               source={{ uri: auth.currentUser?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} 
               style={styles.userAvatar} 
             />
             <Text style={styles.username}>@{auth.currentUser?.displayName || 'User'}</Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="What's on your mind?..."
            placeholderTextColor="#999"
            multiline
            maxLength={200}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={styles.charCount}>{caption.length}/200</Text>
        </View>
      </ScrollView>

      {/* OVERLAY WHILE UPLOADING */}
      {isUploading && (
        <View style={styles.overlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loaderText}>Sharing your post...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  closeBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  shareBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
  },
  disabledBtn: { backgroundColor: '#FFB5B5' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { paddingBottom: 40 },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: { width: '100%', height: '100%' },
  previewImage: { width: '100%', height: '100%' },
  editIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderMainText: { fontSize: 16, fontWeight: '600', color: '#444' },
  placeholderSubText: { fontSize: 12, color: '#999', marginTop: 5 },
  inputWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    minHeight: 300,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  userAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  username: { fontWeight: '600', color: '#555', fontSize: 15 },
  captionInput: {
    fontSize: 17,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#BBB',
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loaderCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  loaderText: { marginTop: 15, fontWeight: '700', color: '#333' },
});