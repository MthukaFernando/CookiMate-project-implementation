import React, { useState, useEffect, useCallback } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
} from "@expo/vector-icons";
import { auth } from "../../config/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

const DIETARY_OPTIONS = [
  {
    id: "1",
    name: "Vegetarian",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "2",
    name: "Vegan",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "3",
    name: "Gluten-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "4",
    name: "Dairy-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "5",
    name: "Nut-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "6",
    name: "Egg-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "7",
    name: "Soy-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "8",
    name: "Fish-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "9",
    name: "Shellfish-Free",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "10",
    name: "Keto",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "11",
    name: "Paleo",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "12",
    name: "Low-Carb",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "13",
    name: "Low-Fat",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "14",
    name: "Halal",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "15",
    name: "Kosher",
    icon: "food-apple",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
];

const ALLERGY_OPTIONS = [
  {
    id: "a1",
    name: "Peanuts",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a2",
    name: "Tree Nuts",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a3",
    name: "Milk",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a4",
    name: "Eggs",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a5",
    name: "Wheat",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a6",
    name: "Soy",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a7",
    name: "Fish",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a8",
    name: "Shellfish",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a9",
    name: "Sesame",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
  {
    id: "a10",
    name: "Sulfites",
    icon: "food-off",
    iconFamily: "MaterialCommunityIcons",
    color: "#D4AF37",
  },
];

// AsyncStorage keys
const STORAGE_KEYS = {
  notifications: "settings_notifications",
  dietary: "settings_dietary",
  allergies: "settings_allergies",
  customPreferences: "settings_customPreferences",
};

// Icon renderer — kept outside components so it's stable
const renderIcon = (item: any, size: number = 20) => {
  const props = { size, color: item.color };
  if (item.iconFamily === "FontAwesome5")
    return <FontAwesome5 name={item.icon} {...props} />;
  if (item.iconFamily === "MaterialCommunityIcons")
    return <MaterialCommunityIcons name={item.icon} {...props} />;
  if (item.iconFamily === "AntDesign")
    return <AntDesign name={item.icon} {...props} />;
  return <Feather name={item.icon} {...props} />;
};

// ── Modals defined OUTSIDE Settings so they never remount on state change ─────

// ── Themed Alert (replaces native Alert.alert for consistent dark styling) ────
interface ThemedAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}
interface ThemedAlertConfig {
  title: string;
  message?: string;
  buttons?: ThemedAlertButton[];
  type?: "info" | "success" | "error" | "warning";
}

const ThemedAlert = ({
  visible,
  title,
  message,
  buttons,
  type = "info",
  onClose,
}: ThemedAlertConfig & { visible: boolean; onClose: () => void }) => {
  const iconMap = {
    success: "check-circle",
    error: "alert-circle",
    warning: "alert-triangle",
    info: "info",
  };
  const colorMap = {
    success: "#4CAF50",
    error: "#FF4444",
    warning: "#FF9800",
    info: "#D4AF37",
  };
  const icon = iconMap[type];
  const color = colorMap[type];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={alertStyles.overlay}>
        <View style={alertStyles.card}>
          <View
            style={[
              alertStyles.iconCircle,
              { backgroundColor: color + "22", borderColor: color + "55" },
            ]}
          >
            <Feather name={icon as any} size={28} color={color} />
          </View>
          <Text style={alertStyles.title}>{title}</Text>
          {message ? <Text style={alertStyles.message}>{message}</Text> : null}
          <View
            style={[
              alertStyles.btnRow,
              (buttons?.length ?? 1) === 1 && { justifyContent: "center" },
            ]}
          >
            {(buttons ?? [{ text: "OK" }]).map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  alertStyles.btn,
                  btn.style === "destructive" && alertStyles.btnDestructive,
                  btn.style === "cancel" && alertStyles.btnCancel,
                  btn.style !== "destructive" &&
                    btn.style !== "cancel" &&
                    alertStyles.btnPrimary,
                  (buttons?.length ?? 1) > 1 && alertStyles.btnFlex,
                ]}
                onPress={() => {
                  onClose();
                  btn.onPress?.();
                }}
              >
                <Text
                  style={[
                    alertStyles.btnText,
                    btn.style === "destructive" && { color: "#FF4444" },
                    btn.style === "cancel" && { color: "#A6A6A6" },
                    btn.style !== "destructive" &&
                      btn.style !== "cancel" && { color: "#0A0A0A" },
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook to imperatively show themed alerts — mirrors the Alert.alert API
const useThemedAlert = () => {
  const [alertConfig, setAlertConfig] = useState<
    (ThemedAlertConfig & { visible: boolean }) | null
  >(null);
  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: ThemedAlertButton[],
      type?: ThemedAlertConfig["type"],
    ) => {
      setAlertConfig({ visible: true, title, message, buttons, type });
    },
    [],
  );
  const hideAlert = useCallback(
    () => setAlertConfig((prev) => (prev ? { ...prev, visible: false } : null)),
    [],
  );
  const AlertComponent = alertConfig ? (
    <ThemedAlert {...alertConfig} onClose={hideAlert} />
  ) : null;
  return { showAlert, AlertComponent };
};

const DietaryModal = ({
  visible,
  onClose,
  selected,
  onToggle,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  onToggle: (n: string) => void;
  onSave: () => void;
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Dietary Preferences</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#A6A6A6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>
          Select your dietary preferences:
        </Text>
        <FlatList
          data={DIETARY_OPTIONS}
          keyExtractor={(item) => item.id}
          style={styles.optionsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                selected.includes(item.name) && styles.optionItemSelected,
              ]}
              onPress={() => onToggle(item.name)}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: "rgba(212,175,55,0.15)" },
                ]}
              >
                {renderIcon(item)}
              </View>
              <Text style={styles.optionText}>{item.name}</Text>
              {selected.includes(item.name) && (
                <Feather
                  name="check"
                  size={20}
                  color="#D4AF37"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const AllergiesModal = ({
  visible,
  onClose,
  selected,
  onToggle,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  selected: string[];
  onToggle: (n: string) => void;
  onSave: () => void;
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Allergies & Intolerances</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="#A6A6A6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>
          Select any allergies or intolerances:
        </Text>
        <FlatList
          data={ALLERGY_OPTIONS}
          keyExtractor={(item) => item.id}
          style={styles.optionsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                selected.includes(item.name) && styles.optionItemSelected,
              ]}
              onPress={() => onToggle(item.name)}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: "rgba(255,68,68,0.15)" },
                ]}
              >
                {renderIcon(item)}
              </View>
              <Text style={styles.optionText}>{item.name}</Text>
              {selected.includes(item.name) && (
                <Feather
                  name="check"
                  size={20}
                  color="#D4AF37"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Allergies</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const CustomPrefModal = ({
  visible,
  onClose,
  customPreferences,
  onRemove,
  onAddNew,
}: {
  visible: boolean;
  onClose: () => void;
  customPreferences: string[];
  onRemove: (pref: string) => void;
  onAddNew: (preference: string) => void;
}) => {
  const [newPreference, setNewPreference] = useState("");

  const handleAdd = () => {
    if (newPreference.trim()) {
      onAddNew(newPreference.trim());
      setNewPreference("");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Preferences</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#A6A6A6" />
              </TouchableOpacity>
            </View>

            {/* Add new preference section */}
            <View style={styles.addSectionTop}>
              <Text style={styles.modalSubtitle}>Add new preference:</Text>
              <View style={styles.addRow}>
                <TextInput
                  style={styles.customInputInline}
                  placeholder="e.g., No mushrooms, Low sodium, etc."
                  placeholderTextColor="#A6A6A6"
                  value={newPreference}
                  onChangeText={setNewPreference}
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                  <Feather name="plus" size={24} color="#0A0A0A" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>
              Your custom preferences:
            </Text>

            {/* List of custom preferences */}
            {customPreferences.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No custom preferences added yet
                </Text>
              </View>
            ) : (
              <View style={styles.customPrefList}>
                {customPreferences.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.customPrefItem}>
                    <View style={styles.customPrefItemContent}>
                      <View
                        style={[
                          styles.optionIcon,
                          {
                            backgroundColor: "rgba(212,175,55,0.15)",
                            width: 36,
                            height: 36,
                          },
                        ]}
                      >
                        <Feather name="edit" size={18} color="#D4AF37" />
                      </View>
                      <Text style={styles.customPrefText}>{item}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemove(item)}
                    >
                      <Feather name="trash-2" size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Change Password Modal ──────────────────────────────────────────────────────
const ChangePasswordModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showAlert, AlertComponent: PwAlert } = useThemedAlert();

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert(
        "Missing Fields",
        "Please fill in all fields.",
        undefined,
        "warning",
      );
      return;
    }
    if (newPassword.length < 6) {
      showAlert(
        "Too Short",
        "New password must be at least 6 characters.",
        undefined,
        "warning",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert(
        "Mismatch",
        "New passwords do not match.",
        undefined,
        "warning",
      );
      return;
    }
    if (newPassword === currentPassword) {
      showAlert(
        "Same Password",
        "New password must be different from your current one.",
        undefined,
        "warning",
      );
      return;
    }
    const user = auth.currentUser;
    if (!user?.email) {
      showAlert("Error", "No user session found.", undefined, "error");
      return;
    }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showAlert(
        "Success",
        "Password updated successfully!",
        [{ text: "OK", onPress: handleClose }],
        "success",
      );
    } catch (err: any) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        showAlert(
          "Wrong Password",
          "Your current password is incorrect.",
          undefined,
          "error",
        );
      } else if (err.code === "auth/too-many-requests") {
        showAlert(
          "Too Many Attempts",
          "Too many failed attempts. Try again later.",
          undefined,
          "error",
        );
      } else {
        showAlert(
          "Error",
          err.message || "Failed to change password.",
          undefined,
          "error",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#A6A6A6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Enter your current password and choose a new one.
          </Text>

          <Text style={styles.pwLabel}>Current Password</Text>
          <View style={styles.pwInputRow}>
            <TextInput
              style={styles.pwInput}
              placeholder="Current password"
              placeholderTextColor="#555"
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrent((v) => !v)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showCurrent ? "eye-off" : "eye"}
                size={18}
                color="#A6A6A6"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.pwLabel}>New Password</Text>
          <View style={styles.pwInputRow}>
            <TextInput
              style={styles.pwInput}
              placeholder="New password (min. 6 characters)"
              placeholderTextColor="#555"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNew((v) => !v)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showNew ? "eye-off" : "eye"}
                size={18}
                color="#A6A6A6"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.pwLabel}>Confirm New Password</Text>
          <View style={styles.pwInputRow}>
            <TextInput
              style={styles.pwInput}
              placeholder="Confirm new password"
              placeholderTextColor="#555"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showConfirm ? "eye-off" : "eye"}
                size={18}
                color="#A6A6A6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {PwAlert}
    </Modal>
  );
};

// ── Delete Account Modal (cross-platform — no Alert.prompt) ───────────────────
const DeleteAccountModal = ({
  visible,
  onClose,
  onConfirm,
  deleting,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  deleting: boolean;
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showAlert, AlertComponent: DelAlert } = useThemedAlert();

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onClose();
  };
  const handleConfirm = () => {
    if (!password.trim()) {
      showAlert(
        "Required",
        "Please enter your password.",
        undefined,
        "warning",
      );
      return;
    }
    onConfirm(password);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: "#FF4444" }]}>
              Delete Account
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#A6A6A6" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            This action is permanent and cannot be undone. All your data,
            recipes, and posts will be deleted.
          </Text>

          <Text style={styles.pwLabel}>Enter your password to confirm</Text>
          <View style={styles.pwInputRow}>
            <TextInput
              style={styles.pwInput}
              placeholder="Your password"
              placeholderTextColor="#555"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#A6A6A6"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: "#FF4444", marginTop: 20 },
              deleting && { opacity: 0.6 },
            ]}
            onPress={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.saveButtonText, { color: "#fff" }]}>
                Delete My Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: "#2A2A2A", marginTop: 10 },
            ]}
            onPress={handleClose}
            disabled={deleting}
          >
            <Text style={[styles.saveButtonText, { color: "#A6A6A6" }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {DelAlert}
    </Modal>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const Settings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [dietaryModalVisible, setDietaryModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [customPreferenceModal, setCustomPreferenceModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;
  const { showAlert, AlertComponent: SettingsAlert } = useThemedAlert();

  // Load preferences from backend when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from backend first if user is logged in
        if (uid) {
          const response = await axios.get(
            `${API_URL}/api/users/preferences/${uid}`,
          );
          if (response.data) {
            setDietaryPreferences(response.data.dietaryPreferences || []);
            setAllergies(response.data.allergies || []);
            setCustomPreferences(response.data.customPreferences || []);

            // Also save to AsyncStorage for offline use
            await persistDietary(
              response.data.dietaryPreferences || [],
              response.data.allergies || [],
              response.data.customPreferences || [],
            );
          }
        } else {
          // Fallback to AsyncStorage if not logged in
          const [notif, dietary, allerg, custom] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.notifications),
            AsyncStorage.getItem(STORAGE_KEYS.dietary),
            AsyncStorage.getItem(STORAGE_KEYS.allergies),
            AsyncStorage.getItem(STORAGE_KEYS.customPreferences),
          ]);

          if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
          if (dietary !== null) setDietaryPreferences(JSON.parse(dietary));
          if (allerg !== null) setAllergies(JSON.parse(allerg));
          if (custom !== null) setCustomPreferences(JSON.parse(custom));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        // Fallback to AsyncStorage if backend fails
        const [notif, dietary, allerg, custom] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
          AsyncStorage.getItem(STORAGE_KEYS.dietary),
          AsyncStorage.getItem(STORAGE_KEYS.allergies),
          AsyncStorage.getItem(STORAGE_KEYS.customPreferences),
        ]);

        if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
        if (dietary !== null) setDietaryPreferences(JSON.parse(dietary));
        if (allerg !== null) setAllergies(JSON.parse(allerg));
        if (custom !== null) setCustomPreferences(JSON.parse(custom));
      }
    };

    loadSettings();
  }, [uid]);

  // Persist dietary/allergy/custom data together
  const persistDietary = async (
    dietary: string[],
    allerg: string[],
    custom: string[],
  ) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.dietary, JSON.stringify(dietary)),
      AsyncStorage.setItem(STORAGE_KEYS.allergies, JSON.stringify(allerg)),
      AsyncStorage.setItem(
        STORAGE_KEYS.customPreferences,
        JSON.stringify(custom),
      ),
    ]);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.notifications,
        JSON.stringify(value),
      );
    } catch (err) {
      console.error("Error saving notification setting:", err);
    }
  };

  const toggleDietaryOption = (name: string) =>
    setDietaryPreferences((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );

  const toggleAllergy = (name: string) =>
    setAllergies((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );

  const saveDietaryPreferences = async () => {
    try {
      setLoading(true);

      // Save to AsyncStorage first (for offline/local use)
      await persistDietary(dietaryPreferences, allergies, customPreferences);

      // Save to backend if user is logged in
      if (uid) {
        const response = await axios.put(
          `${API_URL}/api/users/preferences/${uid}`,
          {
            dietaryPreferences,
            allergies,
            customPreferences,
          },
        );

        if (response.data.success) {
          showAlert(
            "Success",
            "Dietary preferences saved!",
            undefined,
            "success",
          );
        }
      } else {
        showAlert(
          "Success",
          "Preferences saved locally!",
          undefined,
          "success",
        );
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      showAlert(
        "Error",
        "Failed to save dietary preferences",
        undefined,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const addCustomPreference = async (newPreference: string) => {
    const updated = [...customPreferences, newPreference];
    setCustomPreferences(updated);
    try {
      await persistDietary(dietaryPreferences, allergies, updated);
      // Also save to backend if logged in
      if (uid) {
        await axios.put(`${API_URL}/api/users/preferences/${uid}`, {
          dietaryPreferences,
          allergies,
          customPreferences: updated,
        });
      }
      showAlert("Success", "Custom preference added!", undefined, "success");
    } catch (err) {
      console.error("Error saving custom preference:", err);
      showAlert("Error", "Failed to add custom preference", undefined, "error");
    }
  };

  const removeCustomPreference = async (preferenceToRemove: string) => {
    const updated = customPreferences.filter(p => p !== preferenceToRemove);
    setCustomPreferences(updated);
    try {
      await persistDietary(dietaryPreferences, allergies, updated);
      // Also save to backend if logged in
      if (uid) {
        await axios.put(`${API_URL}/api/users/preferences/${uid}`, {
          dietaryPreferences,
          allergies,
          customPreferences: updated,
        });
      }
      showAlert("Success", "Custom preference removed!", undefined, "success");
    } catch (err) {
      console.error("Error removing custom preference:", err);
      showAlert("Error", "Failed to remove custom preference", undefined, "error");
    }
  };

  // ── Logout: sign out Firebase, clear token, go to login ───────────────────
  const handleLogout = () => {
    showAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await auth.signOut();
            await AsyncStorage.removeItem("userToken");
            // Use the absolute Expo Router path to your login screen.
            // Adjust this path if your login file lives elsewhere (e.g. "/login").
            router.replace("/(auth)/loginPage" as any);
          } catch (error) {
            showAlert(
              "Error",
              "Failed to log out. Please try again.",
              undefined,
              "error",
            );
          }
        },
      },
    ]);
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    setDeleteAccountModal(true);
  };

  const confirmDeleteAccount = async (password: string) => {
    const user = auth.currentUser;
    if (!user?.email) {
      showAlert("Error", "No user session found.", undefined, "error");
      return;
    }
    setDeleting(true);
    try {
      // Re-authenticate — Firebase requires this before deleting an account
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      // Delete MongoDB document first
      if (uid) await axios.delete(`${API_URL}/api/users/${uid}`);
      // Then delete Firebase account
      await user.delete();
      await AsyncStorage.removeItem("userToken");
      setDeleteAccountModal(false);
      router.replace("/(auth)/loginPage" as any);
    } catch (err: any) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        showAlert(
          "Wrong Password",
          "Incorrect password. Account not deleted.",
          undefined,
          "error",
        );
      } else if (err.code === "auth/too-many-requests") {
        showAlert(
          "Too Many Attempts",
          "Too many failed attempts. Try again later.",
          undefined,
          "error",
        );
      } else {
        showAlert(
          "Error",
          "Failed to delete account. Please try again.",
          undefined,
          "error",
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>

        <Text style={styles.settingsTitle}>Settings</Text>

        {/* Notifications */}
        <View style={styles.settingCard}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(212,175,55,0.15)" },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#D4AF37"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>
                Enable or disable all notifications
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#2A2A2A", true: "#D4AF37" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2A2A2A"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        {/* Dietary Preferences */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setDietaryModalVisible(true)}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(212,175,55,0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="food-apple"
                size={24}
                color="#D4AF37"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Dietary Preferences</Text>
              <Text style={styles.cardSubtitle}>
                {dietaryPreferences.length > 0
                  ? dietaryPreferences.slice(0, 2).join(", ") +
                    (dietaryPreferences.length > 2 ? "..." : "")
                  : "Set your dietary restrictions"}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#D4AF37" />
        </TouchableOpacity>

        {/* Allergies */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setAllergyModalVisible(true)}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(212,175,55,0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="food-off"
                size={24}
                color="#D4AF37"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Allergies & Intolerances</Text>
              <Text style={styles.cardSubtitle}>
                {allergies.length > 0
                  ? allergies.slice(0, 2).join(", ") +
                    (allergies.length > 2 ? "..." : "")
                  : "Add your allergies"}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#D4AF37" />
        </TouchableOpacity>

        {/* Custom Preferences */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setCustomPreferenceModal(true)}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(212,175,55,0.15)" },
              ]}
            >
              <Feather name="edit" size={24} color="#D4AF37" />
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
          <Feather name="chevron-right" size={24} color="#D4AF37" />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setChangePasswordModal(true)}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(212,175,55,0.15)" },
              ]}
            >
              <Feather name="lock" size={24} color="#D4AF37" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>
                Update your account password
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#D4AF37" />
        </TouchableOpacity>

        {/* Log Out */}
        <TouchableOpacity
          style={[styles.settingCard, styles.logoutCard]}
          onPress={handleLogout}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(255,68,68,0.15)" },
              ]}
            >
              <Feather name="log-out" size={24} color="#D4AF37" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, styles.logoutText]}>Log Out</Text>
              <Text style={styles.cardSubtitle}>Sign out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.settingCard, styles.deleteCard]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(255,68,68,0.15)" },
              ]}
            >
              <Feather name="trash-2" size={24} color="#FF4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, styles.deleteText]}>
                Delete Account
              </Text>
              <Text style={styles.cardSubtitle}>
                Permanently delete your account
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals receive state as props — no remounting */}
      <ChangePasswordModal
        visible={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
      />
      <DeleteAccountModal
        visible={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        onConfirm={confirmDeleteAccount}
        deleting={deleting}
      />
      <DietaryModal
        visible={dietaryModalVisible}
        onClose={() => setDietaryModalVisible(false)}
        selected={dietaryPreferences}
        onToggle={toggleDietaryOption}
        onSave={() => {
          saveDietaryPreferences();
          setDietaryModalVisible(false);
        }}
      />
      <AllergiesModal
        visible={allergyModalVisible}
        onClose={() => setAllergyModalVisible(false)}
        selected={allergies}
        onToggle={toggleAllergy}
        onSave={() => {
          saveDietaryPreferences();
          setAllergyModalVisible(false);
        }}
      />
      <CustomPrefModal
        visible={customPreferenceModal}
        onClose={() => setCustomPreferenceModal(false)}
        customPreferences={customPreferences}
        onRemove={removeCustomPreference}
        onAddNew={addCustomPreference}
      />

      {SettingsAlert}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  backBtn: {
    marginVertical: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    marginTop: 5,
  },
  settingCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 12, color: "#A6A6A6" },
  logoutCard: { marginTop: 20, borderColor: "#D4AF37" },
  deleteCard: { borderColor: "#FF4444" },
  logoutText: { color: "#D4AF37" },
  deleteText: { color: "#FF4444" },
  bottomSpacing: { height: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#D4AF37" },
  modalSubtitle: { fontSize: 14, color: "#A6A6A6", marginBottom: 15 },
  optionsList: { maxHeight: 400 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  optionItemSelected: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderColor: "#D4AF37",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionText: { fontSize: 14, color: "#FFFFFF", flex: 1 },
  checkIcon: { marginLeft: 10 },
  customInput: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  customPrefList: {
    marginBottom: 20,
  },
  customPrefItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  customPrefItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customPrefText: {
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,68,68,0.15)",
  },
  
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#A6A6A6",
    textAlign: "center",
  },
  addSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 15,
  },
  addSectionTop: {
    marginBottom: 10,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customInputInline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
  },
  addButton: {
    backgroundColor: "#D4AF37",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#0A0A0A", fontSize: 16, fontWeight: "600" },
  pwLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A6A6A6",
    marginBottom: 6,
    marginTop: 12,
  },
  pwInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  pwInput: { flex: 1, color: "#FFFFFF", fontSize: 14, paddingVertical: 12 },
  eyeBtn: { padding: 6 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,10,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#A6A6A6",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  btnFlex: { flex: 1 },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 100,
  },
  btnPrimary: { backgroundColor: "#D4AF37" },
  btnDestructive: {
    backgroundColor: "rgba(255,68,68,0.15)",
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  btnCancel: { backgroundColor: "#2A2A2A" },
  btnText: { fontSize: 15, fontWeight: "600" },
});

export default Settings;