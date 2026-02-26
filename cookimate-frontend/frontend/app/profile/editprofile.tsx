import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform,             
  TouchableWithoutFeedback, 
  Keyboard,             
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { globalStyle } from "../globalStyleSheet.style";

        const debuggerHost = Constants.expoConfig?.hostUri;
        const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
        const API_URL = `http://${address}:5000`

const AVATAR_OPTIONS = [
  "https://res.cloudinary.com/cookimate-images/image/upload/v1770965619/profile_pic1_plo6pj.png",
  "https://res.cloudinary.com/cookimate-images/image/upload/v1770965627/profile_pic2_lvcgse.png",
  "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
];

const EditProfile = () => {
  const router = useRouter();
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid; 

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [selectedPic, setSelectedPic] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/${uid}`);
        const user = response.data;
        setUsername(user.username);
        setName(user.name);
        setSelectedPic(user.profilePic || AVATAR_OPTIONS[0]);
      } catch (err: any) {
        console.log("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/users/update/${uid}`, {
        username,
        name,
        profilePic: selectedPic,
      });
      Alert.alert("Success", "Profile updated!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#923d0a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
            style={[styles.mainContainer, globalStyle.container]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
        >
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#5F4436" />
          </TouchableOpacity>

          
          <View style={styles.topSubContainer}>
            <Text style={styles.welcomemsg}>Customize Profile</Text>
            <View style={styles.mascotCircle}>
              <Image
                source={require("../../assets/images/Home-page-Mascot.jpg")}
                style={styles.mascotImg}
              />
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>Looking good! Which look should we go with today?</Text>
              <View style={styles.bubbleTail} />
            </View>
          </View>

          
          <View style={styles.bottomSubContainer}>
            
            <Text style={styles.label}>Pick an Avatar</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.avatarRow}
            >
              {AVATAR_OPTIONS.map((url, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedPic(url)}
                  style={[styles.avatarBox, selectedPic === url && styles.selectedAvatar]}
                >
                  <Image source={{ uri: url }} style={styles.avatarImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="username"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.saveBtn, saving && { opacity: 0.6 }]} 
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { paddingHorizontal: 25 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2ece2" },
  
  backBtn: {
    marginVertical: 10,
    width: 40,
    height: 40,
    justifyContent: 'center'
  },

  topSubContainer: {
    borderWidth: 1,
    borderColor: "#f0871f45",
    padding: 15,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: '#E0C2A0',
  },
  mascotCircle: {
    width: 140, 
    height: 140,
    borderWidth: 3,
    borderColor: '#EBEBEB',
    borderRadius: 70,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  mascotImg: { width: "100%", height: "100%" },
  welcomemsg: { marginRight: "auto", marginBottom: 10, fontSize: 22, fontWeight: '600', color: "#5D4037" },
  bubble: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    maxWidth: "90%",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bubbleText: { fontSize: 14, color: "#5D4037", textAlign: "center" },
  bubbleTail: {
    position: "absolute",
    top: -8,
    left: "20%",
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
    zIndex: -1,
  },

  bottomSubContainer: {
    padding: 20,
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E8C28E',
    marginBottom: 40, // Space so button isn't cramped at bottom
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#5D4037', marginBottom: 8, marginTop: 10 },
  avatarRow: { paddingVertical: 10, gap: 15 },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#eee',
    padding: 2
  },
  selectedAvatar: { borderColor: '#B86D2A', backgroundColor: '#fdf3e7' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 35 },
  
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#333'
  },

  saveBtn: {
    backgroundColor: '#B86D2A', 
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default EditProfile;