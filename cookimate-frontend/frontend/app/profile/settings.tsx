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
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { auth } from "../../config/firebase";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

// Predefined dietary preferences options with food-related icons
const DIETARY_OPTIONS = [
  { id: '1', name: 'Vegetarian', icon: 'carrot', iconFamily: 'FontAwesome5', color: '#4CAF50' },
  { id: '2', name: 'Vegan', icon: 'seedling', iconFamily: 'FontAwesome5', color: '#8BC34A' },
  { id: '3', name: 'Gluten-Free', icon: 'bread-slice', iconFamily: 'FontAwesome5', color: '#FF9800' },
  { id: '4', name: 'Dairy-Free', icon: 'cheese', iconFamily: 'FontAwesome5', color: '#2196F3' },
  { id: '5', name: 'Nut-Free', icon: 'peanuts', iconFamily: 'MaterialCommunityIcons', color: '#9C27B0' },
  { id: '6', name: 'Egg-Free', icon: 'egg', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: '7', name: 'Soy-Free', icon: 'seedling', iconFamily: 'FontAwesome5', color: '#3F51B5' },
  { id: '8', name: 'Fish-Free', icon: 'fish', iconFamily: 'FontAwesome5', color: '#00BCD4' },
  { id: '9', name: 'Shellfish-Free', icon: 'shrimp', iconFamily: 'FontAwesome5', color: '#009688' },
  { id: '10', name: 'Keto', icon: 'bacon', iconFamily: 'FontAwesome5', color: '#FF5722' },
  { id: '11', name: 'Paleo', icon: 'drumstick-bite', iconFamily: 'FontAwesome5', color: '#795548' },
  { id: '12', name: 'Low-Carb', icon: 'candy-cane', iconFamily: 'FontAwesome5', color: '#607D8B' },
  { id: '13', name: 'Low-Fat', icon: 'lemon', iconFamily: 'FontAwesome5', color: '#FFC107' },
  { id: '14', name: 'Halal', icon: 'mosque', iconFamily: 'FontAwesome5', color: '#4A5568' },
  { id: '15', name: 'Kosher', icon: 'star-of-david', iconFamily: 'FontAwesome5', color: '#2D3748' },
];

// Common allergies options with food-related icons
const ALLERGY_OPTIONS = [
  { id: 'a1', name: 'Peanuts', icon: 'peanuts', iconFamily: 'MaterialCommunityIcons', color: '#F44336' },
  { id: 'a2', name: 'Tree Nuts', icon: 'tree', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a3', name: 'Milk', icon: 'cow', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a4', name: 'Eggs', icon: 'egg', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a5', name: 'Wheat', icon: 'wheat', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a6', name: 'Soy', icon: 'seedling', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a7', name: 'Fish', icon: 'fish', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a8', name: 'Shellfish', icon: 'shrimp', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a9', name: 'Sesame', icon: 'seedling', iconFamily: 'FontAwesome5', color: '#F44336' },
  { id: 'a10', name: 'Sulfites', icon: 'flask', iconFamily: 'FontAwesome5', color: '#F44336' },
];

const Settings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dietaryModalVisible, setDietaryModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [customPreferenceModal, setCustomPreferenceModal] = useState(false);
  
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newCustomPreference, setNewCustomPreference] = useState('');
  
  // Simple notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  // Fetch notification setting
  const fetchNotificationSetting = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${uid}/notifications`);
      if (response.data) {
        setNotificationsEnabled(response.data.enabled ?? true);
      }
    } catch (err) {
      console.error("Error fetching notification setting:", err);
    }
  };

  useEffect(() => {
    fetchDietaryPreferences();
    fetchNotificationSetting();
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

  // Save notification setting
  const saveNotificationSetting = async (enabled: boolean) => {
    try {
      await axios.put(`${API_URL}/api/users/${uid}/notifications`, { enabled });
    } catch (err) {
      console.error("Error saving notification setting:", err);
    }
  };

  // Toggle notification
  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveNotificationSetting(value);
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

  // Helper function to render icon based on family
  const renderIcon = (item: any, size: number = 20) => {
    const iconProps = {
      size,
      color: item.color,
    };

    if (item.iconFamily === 'FontAwesome5') {
      return <FontAwesome5 name={item.icon} {...iconProps} />;
    } else if (item.iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} {...iconProps} />;
    } else {
      return <Feather name={item.icon} {...iconProps} />;
    }
  };

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
                  {renderIcon(item)}
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
                  {renderIcon(item)}
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

        {/* Notifications Card with Toggle */}
        <View style={styles.settingCard}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#923d0a20' }]}>
              <Ionicons name="notifications-outline" size={24} color="#923d0a" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>Enable or disable all notifications</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor={"#fff"}
            ios_backgroundColor="#E0E0E0"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

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
              <MaterialCommunityIcons name="food-off" size={24} color="#923d0a" />
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