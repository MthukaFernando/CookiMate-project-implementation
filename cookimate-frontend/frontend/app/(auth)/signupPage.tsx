import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

export default function SignupPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    buttons: { text: string; style?: "default" | "cancel"; onPress?: () => void }[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  const showAlert = (
    title: string,
    message: string,
    buttons: { text: string; style?: "default" | "cancel"; onPress?: () => void }[] = [{ text: "OK" }],
    icon?: string
  ) => setAlertConfig({ visible: true, title, message, buttons, icon });

  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) setEmailError("Email is required");
    else if (!regex.test(value)) setEmailError("Enter a valid email");
    else setEmailError("");
    setEmail(value);
  };

  const validatePassword = (value: string) => {
    setPassword(value);
    if (!value) setPasswordError("Password is required");
    else if (value.length < 6) setPasswordError("At least 6 characters");
    else setPasswordError("");

    if (confirmPassword) {
      if (value !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const validateConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (!value) {
      setConfirmPasswordError("Please confirm your password");
    } else if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignup = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (
      !email ||
      !password ||
      !confirmPassword ||
      emailError ||
      passwordError ||
      confirmPasswordError
    ) {
      showAlert("Fix Errors", "Please fix the errors in the form.", [{ text: "OK" }], "alert-circle");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      await axios.post(`${API_URL}/api/users`, {
        firebaseUid: user.uid,
        username: username,
        name: fullName,
      });
      await sendEmailVerification(user);
      await signOut(auth);

      setIsLoading(false);
      showAlert(
        "Verify Your Email",
        `An activation link has been sent to ${email}.`,
        [{ text: "OK", onPress: () => router.replace("/loginPage") }],
        "mail"
      );
    } catch (error: any) {
      setIsLoading(false);
      showAlert("Signup Failed", error.message, [{ text: "Try Again" }], "alert-circle");
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailTouched && emailError ? styles.errorBorder : null,
              ]}
              placeholder="Enter email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={validateEmail}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                passwordTouched && passwordError ? styles.errorBorder : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={validatePassword}
                onBlur={() => setPasswordTouched(true)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#D4AF37"
                />
              </TouchableOpacity>
            </View>
            {passwordTouched && passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.passwordContainer,
                confirmPasswordTouched && confirmPasswordError
                  ? styles.errorBorder
                  : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={validateConfirmPassword}
                onBlur={() => setConfirmPasswordTouched(true)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#D4AF37"
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordTouched && confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.signupText}>Sign up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Link href="/loginPage" style={styles.link}>
                Already have an account?{" "}
                <Text style={{ fontWeight: "bold" }}>Log in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>

      {/* Custom Alert Modal */}
      <Modal transparent visible={alertConfig.visible} animationType="fade" onRequestClose={hideAlert}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            {alertConfig.icon && (
              <View style={[
                styles.alertIconWrapper,
                { borderColor: alertConfig.icon === "mail" ? "#D4AF37" : "#FF5252" }
              ]}>
                <Ionicons
                  name={alertConfig.icon as any}
                  size={30}
                  color={alertConfig.icon === "mail" ? "#D4AF37" : "#FF5252"}
                />
              </View>
            )}
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={[styles.alertButtonRow, alertConfig.buttons.length === 1 && { justifyContent: "center" }]}>
              {alertConfig.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.alertButton,
                    btn.style === "cancel" ? styles.alertButtonCancel : styles.alertButtonDefault,
                  ]}
                  onPress={() => { hideAlert(); btn.onPress?.(); }}
                >
                  <Text style={[
                    styles.alertButtonText,
                    btn.style === "cancel" ? styles.alertBtnTextCancel : styles.alertBtnTextDefault,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#D4AF37",
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(18, 18, 18, 0.85)",
    padding: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderColor: "#333333",
    borderRadius: 12,
    height: 48,
    padding: 12,
    marginBottom: 10,
    color: "#FFFFFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderColor: "#333333",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
  },
  eyeIcon: { padding: 4 },
  errorBorder: { borderColor: "#e74c3c" },
  errorText: { color: "#e74c3c", fontSize: 11, marginBottom: 8 },
  signupButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: { backgroundColor: "#555" },
  signupText: { color: "#000", fontSize: 17, fontWeight: "bold" },
  bottomRow: { marginTop: 25, alignItems: "center" },
  link: {
    color: "#D4AF37",
    fontSize: 15,
  },
  // Custom Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  alertBox: {
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
  },
  alertIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D4AF37",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  alertMessage: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  alertButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  alertButtonDefault: { backgroundColor: "#D4AF37" },
  alertButtonCancel: { backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#333333" },
  alertButtonText: { fontSize: 14, fontWeight: "700" },
  alertBtnTextDefault: { color: "#000000" },
  alertBtnTextCancel: { color: "#AAAAAA" },
});
