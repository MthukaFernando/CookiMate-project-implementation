import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase'; 

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    buttons: { text: string; onPress?: () => void }[];
  }>({ visible: false, title: '', message: '', buttons: [] });

  const showAlert = (
    title: string,
    message: string,
    buttons: { text: string; onPress?: () => void }[] = [{ text: 'OK' }],
    icon?: string
  ) => setAlertConfig({ visible: true, title, message, buttons, icon });

  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  const handleResetPassword = async () => {
    if (!email) {
      showAlert("Missing Email", "Please enter your email address.", [{ text: "OK" }], "mail-outline");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showAlert(
        "Email Sent",
        "Check your email for a link to reset your password.",
        [{ text: "OK", onPress: () => router.back() }],
        "checkmark-circle"
      );
    } catch (error: any) {
      console.log(error.code);
      let msg = "Failed to send reset email.";
      if (error.code === 'auth/invalid-email') msg = "Invalid email format.";
      if (error.code === 'auth/user-not-found') msg = "No user found with this email.";
      showAlert("Error", msg, [{ text: "Try Again" }], "alert-circle");
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <ImageBackground
      source={require('../../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Enter the email associated with your account and we'll send you a link to reset your password.
            </Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
              <Text style={styles.resetText}>Send Reset Link</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>Back to Login</Text>
            </TouchableOpacity>
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
                { borderColor: alertConfig.icon === "checkmark-circle" ? "#5f4436e6" : alertConfig.icon === "mail-outline" ? "#D4AF37" : "#cc3300" }
              ]}>
                <Ionicons
                  name={alertConfig.icon as any}
                  size={30}
                  color={alertConfig.icon === "checkmark-circle" ? "#5f4436e6" : alertConfig.icon === "mail-outline" ? "#D4AF37" : "#cc3300"}
                />
              </View>
            )}
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <View style={styles.alertButtonRow}>
              {alertConfig.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.alertButton}
                  onPress={() => { hideAlert(); btn.onPress?.(); }}
                >
                  <Text style={styles.alertButtonText}>{btn.text}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(255, 241, 196, 0.75)',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#160303",
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#160303",
  },
  input: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: "#ffffff",
    borderRadius: 8,
    height: 40,
    padding: 10,
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: "#5f4436e6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    marginTop: 15,
    color: '#333',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  // Custom Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  alertBox: {
    backgroundColor: 'rgba(255, 241, 196, 0.97)',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  alertIconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#160303',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  alertButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    backgroundColor: '#5f4436e6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
