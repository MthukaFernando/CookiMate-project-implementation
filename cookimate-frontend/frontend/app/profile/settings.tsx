import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
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

// Predefined dietary preferences options
const DIETARY_OPTIONS = [
  { id: '1', name: 'Vegetarian', icon: 'leaf', color: '#4CAF50' },
  { id: '2', name: 'Vegan', icon: 'leaf', color: '#8BC34A' },
  { id: '3', name: 'Gluten-Free', icon: 'leaf', color: '#FF9800' },
  { id: '4', name: 'Dairy-Free', icon: 'leaf', color: '#2196F3' },
  { id: '5', name: 'Nut-Free', icon: 'leaf', color: '#9C27B0' },
  { id: '6', name: 'Egg-Free', icon: 'leaf', color: '#F44336' },
  { id: '7', name: 'Soy-Free', icon: 'leaf', color: '#3F51B5' },
  { id: '8', name: 'Fish-Free', icon: 'leaf', color: '#00BCD4' },
  { id: '9', name: 'Shellfish-Free', icon: 'leaf', color: '#009688' },
  { id: '10', name: 'Keto', icon: 'leaf', color: '#FF5722' },
  { id: '11', name: 'Paleo', icon: 'leaf', color: '#795548' },
  { id: '12', name: 'Low-Carb', icon: 'leaf', color: '#607D8B' },
  { id: '13', name: 'Low-Fat', icon: 'leaf', color: '#FFC107' },
  { id: '14', name: 'Halal', icon: 'leaf', color: '#4A5568' },
  { id: '15', name: 'Kosher', icon: 'leaf', color: '#2D3748' },
];

// Common allergies options
const ALLERGY_OPTIONS = [
  { id: 'a1', name: 'Peanuts', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a2', name: 'Tree Nuts', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a3', name: 'Milk', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a4', name: 'Eggs', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a5', name: 'Wheat', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a6', name: 'Soy', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a7', name: 'Fish', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a8', name: 'Shellfish', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a9', name: 'Sesame', icon: 'alert-triangle', color: '#F44336' },
  { id: 'a10', name: 'Sulfites', icon: 'alert-triangle', color: '#F44336' },
];

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
  const [dietaryModalVisible, setDietaryModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [customPreferenceModal, setCustomPreferenceModal] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newCustomPreference, setNewCustomPreference] = useState('');
  
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

  // Fetch dietary preferences
  const fetchDietaryPreferences = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${uid}/dietary`);
      if (response.data) {
        setDietaryPreferences(response.data.dietaryPreferences || []);
        setAllergies(response.data.allergies || []);
        setCustomPreferences(response.data.customPreferences || []);
      }
    } catch (err) {
      console.error("Error fetching dietary preferences:", err);
    }
  };

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
    fetchDietaryPreferences();
    fetchNotificationSettings();
  }, []);

  // Save dietary preferences
  const saveDietaryPreferences = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/users/${uid}/dietary`, {
        dietaryPreferences,
        allergies,
        customPreferences,
      });
      Alert.alert("Success", "Dietary preferences updated successfully!");
    } catch (err) {
      console.error("Error saving dietary preferences:", err);
      Alert.alert("Error", "Failed to save dietary preferences");
    } finally {
      setLoading(false);
    }
  };

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

  // Toggle selection functions
  const toggleDietaryOption = (optionName: string) => {
    setDietaryPreferences(prev =>
      prev.includes(optionName)
        ? prev.filter(item => item !== optionName)
        : [...prev, optionName]
    );
  };

  const toggleAllergy = (allergyName: string) => {
    setAllergies(prev =>
      prev.includes(allergyName)
        ? prev.filter(item => item !== allergyName)
        : [...prev, allergyName]
    );
  };

  const addCustomPreference = () => {
    if (newCustomPreference.trim()) {
      setCustomPreferences(prev => [...prev, newCustomPreference.trim()]);
      setNewCustomPreference('');
      setCustomPreferenceModal(false);
    }
  };

  const removeCustomPreference = (preference: string) => {
    setCustomPreferences(prev => prev.filter(item => item !== preference));
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

  // Dietary Preferences Modal
  const DietaryPreferencesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={dietaryModalVisible}
      onRequestClose={() => setDietaryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dietary Preferences</Text>
            <TouchableOpacity onPress={() => setDietaryModalVisible(false)}>
              <Feather name="x" size={24} color="#5D4037" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Select your dietary preferences:</Text>
          
          <FlatList
            data={DIETARY_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  dietaryPreferences.includes(item.name) && styles.optionItemSelected
                ]}
                onPress={() => toggleDietaryOption(item.name)}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.color + '20' }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.optionText}>{item.name}</Text>
                {dietaryPreferences.includes(item.name) && (
                  <Feather name="check" size={20} color="#4CAF50" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              saveDietaryPreferences();
              setDietaryModalVisible(false);
            }}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Allergies Modal
  const AllergiesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={allergyModalVisible}
      onRequestClose={() => setAllergyModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Allergies & Intolerances</Text>
            <TouchableOpacity onPress={() => setAllergyModalVisible(false)}>
              <Feather name="x" size={24} color="#5D4037" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Select any allergies or intolerances:</Text>
          
          <FlatList
            data={ALLERGY_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  allergies.includes(item.name) && styles.optionItemSelected
                ]}
                onPress={() => toggleAllergy(item.name)}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.color + '20' }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.optionText}>{item.name}</Text>
                {allergies.includes(item.name) && (
                  <Feather name="check" size={20} color="#4CAF50" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              saveDietaryPreferences();
              setAllergyModalVisible(false);
            }}
          >
            <Text style={styles.saveButtonText}>Save Allergies</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Custom Preference Modal
  const CustomPreferenceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={customPreferenceModal}
      onRequestClose={() => setCustomPreferenceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Custom Preference</Text>
            <TouchableOpacity onPress={() => setCustomPreferenceModal(false)}>
              <Feather name="x" size={24} color="#5D4037" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Enter your custom dietary preference:</Text>
          
          <TextInput
            style={styles.customInput}
            placeholder="e.g., No mushrooms, Low sodium, etc."
            placeholderTextColor="#999"
            value={newCustomPreference}
            onChangeText={setNewCustomPreference}
            multiline
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={addCustomPreference}
          >
            <Text style={styles.saveButtonText}>Add Preference</Text>
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

        {/* Dietary Preferences Card */}
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => setDietaryModalVisible(true)}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <MaterialCommunityIcons name="food-apple" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Dietary Preferences</Text>
              <Text style={styles.cardSubtitle}>
                {dietaryPreferences.length > 0 
                  ? dietaryPreferences.slice(0, 2).join(', ') + (dietaryPreferences.length > 2 ? '...' : '')
                  : "Set your dietary restrictions"}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#5D4037" />
        </TouchableOpacity>

        {/* Allergies Card */}
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => setAllergyModalVisible(true)}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <MaterialCommunityIcons name="alert" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Allergies & Intolerances</Text>
              <Text style={styles.cardSubtitle}>
                {allergies.length > 0 
                  ? allergies.slice(0, 2).join(', ') + (allergies.length > 2 ? '...' : '')
                  : "Add your allergies"}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#5D4037" />
        </TouchableOpacity>

        {/* Custom Preferences Card */}
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => setCustomPreferenceModal(true)}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <Feather name="edit" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Custom Preferences</Text>
              <Text style={styles.cardSubtitle}>
                {customPreferences.length > 0 
                  ? `${customPreferences.length} custom preference(s) added`
                  : "Add your own preferences"}
              </Text>
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
      <DietaryPreferencesModal />
      <AllergiesModal />
      <CustomPreferenceModal />

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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F4ED',
  },
  optionItemSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 14,
    color: '#5D4037',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E8C28E',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
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