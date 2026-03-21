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
  Alert,
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
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
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            {
              text: "Resend Link",
              onPress: async () => {
                try {
                  await sendEmailVerification(refreshedUser);
                  Alert.alert("Sent", "A new verification link has been sent.");
                } catch (err) {
                  Alert.alert("Error", "Could not resend email.");
                }
              },
            },
            { text: "OK", style: "cancel" },
          ],
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
      Alert.alert("Login Error", msg);
    }
  };

  const navigateToForgot = () => {
    router.push("/forgotPassword");
  };

  return (
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
});
