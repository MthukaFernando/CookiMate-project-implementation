import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Missing Fields", "Please enter both email and password.", [{ text: "OK" }], "alert-circle");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await user.reload();
      const refreshedUser = auth.currentUser;

      if (refreshedUser && !refreshedUser.emailVerified) {
        setLoading(false);
        showAlert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            {
              text: "Resend Link",
              onPress: async () => {
                try {
                  await sendEmailVerification(refreshedUser);
                  showAlert("Sent", "A new verification link has been sent.", [{ text: "OK" }], "mail");
                } catch (err) {
                  showAlert("Error", "Could not resend email.", [{ text: "OK" }], "alert-circle");
                }
              },
            },
            { text: "OK", style: "cancel" },
          ],
          "mail-unread"
        );
        await signOut(auth);
        return;
      }

      setLoading(false);
      router.replace("/");
    } catch (error: any) {
      setLoading(false);
      let msg = "Login failed. Please try again.";
      if (error.code === "auth/invalid-credential")
        msg = "Invalid email or password.";
      showAlert("Login Failed", msg, [{ text: "Try Again" }], "lock-closed");
    }
  };

  const navigateToForgot = () => {
    router.push("/forgotPassword");
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
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

            <TouchableOpacity onPress={navigateToForgot}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginText}>Log in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Link href="/signupPage" style={styles.link}>
                Don't have an account?{" "}
                <Text style={{ fontWeight: "bold" }}>Sign up</Text>
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
                { borderColor: alertConfig.icon === "mail" || alertConfig.icon === "mail-unread" ? "#D4AF37" : alertConfig.icon === "lock-closed" ? "#FF8C00" : "#FF5252" }
              ]}>
                <Ionicons
                  name={alertConfig.icon as any}
                  size={30}
                  color={alertConfig.icon === "mail" || alertConfig.icon === "mail-unread" ? "#D4AF37" : alertConfig.icon === "lock-closed" ? "#FF8C00" : "#FF5252"}
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
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D4AF37",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(18, 18, 18, 0.85)",
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)", 
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderColor: "#333333",
    borderRadius: 10,
    height: 50,
    padding: 12,
    marginBottom: 20,
    color: "#FFFFFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "rgba(26, 26, 26, 0.9)",
    borderColor: "#333333",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  loginText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomRow: {
    marginTop: 25,
    alignItems: "center",
  },
  link: {
    color: "#D4AF37",
    fontSize: 15,
  },
  forgot: {
    fontSize: 13,
    color: "#FF8C00",
    textDecorationLine: "underline",
    alignSelf: "flex-end",
    marginBottom: 15,
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
