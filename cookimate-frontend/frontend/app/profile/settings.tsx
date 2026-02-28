import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../../config/firebase";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

// Notification settings options
const NOTIFICATION_OPTIONS = [
  {
    id: 'n1',
    title: 'Recipe Recommendations',
    description: 'Get personalized recipe suggestions based on your preferences',
    icon: 'bell',
    color: '#923d0a',
  },
  {
    id: 'n2',
    title: 'New Recipes',
    description: 'Notifications when new recipes are added',
    icon: 'bell',
    color: '#923d0a',
  },
  {
    id: 'n3',
    title: 'Cooking Reminders',
    description: 'Reminders for meal planning and cooking times',
    icon: 'bell',
    color: '#923d0a',
  },
  {
    id: 'n4',
    title: 'Community Activity',
    description: 'Updates on likes, comments, and followers',
    icon: 'bell',
    color: '#923d0a',
  },
  {
    id: 'n5',
    title: 'Achievement Alerts',
    description: 'Get notified when you unlock new achievements',
    icon: 'bell',
    color: '#923d0a',
  },
  {
    id: 'n6',
    title: 'Marketing & Promotions',
    description: 'Special offers, tips, and newsletter',
    icon: 'bell',
    color: '#923d0a',
  },
];

const Settings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<{[key: string]: boolean}>({
    n1: true,
    n2: true,
    n3: false,
    n4: true,
    n5: true,
    n6: false,
  });

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  // Fetch notification settings
  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${uid}/notifications`);
      if (response.data) {
        setNotificationSettings(response.data);
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/users/${uid}/notifications`, notificationSettings);
      Alert.alert("Success", "Notification settings updated!");
    } catch (err) {
      console.error("Error saving notification settings:", err);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  // Toggle notification setting
  const toggleNotification = (id: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              await AsyncStorage.removeItem('userToken');
              router.replace("../auth/login");
            } catch (error) {
              Alert.alert("Error", "Failed to log out");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_URL}/api/users/${uid}`);
              await auth.currentUser?.delete();
              await AsyncStorage.removeItem('userToken');
              router.replace("../auth/signup");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Notifications Modal
  const NotificationsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={notificationsModalVisible}
      onRequestClose={() => setNotificationsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setNotificationsModalVisible(false)}>
              <Feather name="x" size={24} color="#5D4037" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Customize your notification preferences:</Text>
          
          <FlatList
            data={NOTIFICATION_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.notificationItem}
                onPress={() => toggleNotification(item.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.color + '20' }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationDescription}>{item.description}</Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  notificationSettings[item.id] && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleDot,
                    notificationSettings[item.id] && styles.toggleDotActive
                  ]} />
                </View>
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              saveNotificationSettings();
              setNotificationsModalVisible(false);
            }}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5F4436" />
        </TouchableOpacity>

        {/* Settings Title */}
        <Text style={styles.settingsTitle}>Settings</Text>

        {/* Notifications Card */}
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => setNotificationsModalVisible(true)}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <Ionicons name="notifications-outline" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>Manage your notification preferences</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#5D4037" />
        </TouchableOpacity>

        {/* Change Password Card */}
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => router.push("../profile/change-password")}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <Feather name="lock" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>Update your account password</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#5D4037" />
        </TouchableOpacity>

        {/* Log Out Card */}
        <TouchableOpacity 
          style={[styles.settingCard, styles.logoutCard]}
          onPress={handleLogout}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#F4433620' }]}>
              <Feather name="log-out" size={24} color="#F44336" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, styles.logoutText]}>Log Out</Text>
              <Text style={styles.cardSubtitle}>Sign out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Delete Account Card */}
        <TouchableOpacity 
          style={[styles.settingCard, styles.deleteCard]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#F4433620' }]}>
              <Feather name="trash-2" size={24} color="#F44336" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, styles.deleteText]}>Delete Account</Text>
              <Text style={styles.cardSubtitle}>Permanently delete your account</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Extra bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      <NotificationsModal />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#923d0a" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f2ece2',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 40,
  },
  backBtn: {
    marginVertical: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 20,
    marginTop: 5,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E8C28E',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8B6B5C',
  },
  logoutCard: {
    marginTop: 20,
    borderColor: '#F44336',
  },
  deleteCard: {
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
  },
  deleteText: {
    color: '#F44336',
  },
  bottomSpacing: {
    height: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8B6B5C',
    marginBottom: 15,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#923d0a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Notification item styles
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F4ED',
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 11,
    color: '#8B6B5C',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Settings;