import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../config/firebase'; 
import { Ionicons } from '@expo/vector-icons'; // Import Icons

export default function LoginPage() {
  const router = useRouter(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for visibility
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload(); 
      const refreshedUser = auth.currentUser;

      // Check if the user is verified
      if (refreshedUser && !refreshedUser.emailVerified) {
        setLoading(false);
        
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in. Check your inbox for the link.',
          [
            { 
              text: 'Resend Link', 
              onPress: async () => {
                try {
                  await sendEmailVerification(refreshedUser);
                  Alert.alert('Sent', 'A new verification link has been sent.');
                } catch (err) {
                  Alert.alert('Error', 'Could not resend email. Try again later.');
                }
              } 
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
        await signOut(auth);
        return; 
      }

      // If verified, proceed to the home page
      setLoading(false);
      router.replace('/'); 
      
    } catch (error: any) {
      setLoading(false);
      console.log(error.code);
      let msg = "Login failed. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "The email address is invalid.";
      }
      Alert.alert('Login Error', msg);
    }
  };

  const navigateToForgot = () => {
    router.push('/forgotPassword'); 
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover" 
    >
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={navigateToForgot}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Log in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <View style={styles.navContainer}>
                <Link href="/signupPage" style={styles.link}>
                  Don't have an account? Sign up
                </Link>
              </View>
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
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  navContainer: {
    flexDirection: 'row',    
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 10,
  },
  link: {
    color: 'black',
    fontSize: 16,
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(255, 241, 196, 0.75)',
    padding: 20,
    borderRadius: 12,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: "#ffffff",
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#5f4436e6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  forgot: {
    fontSize: 13,
    color: "#333",
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});