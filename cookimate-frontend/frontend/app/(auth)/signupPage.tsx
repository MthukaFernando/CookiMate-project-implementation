import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios'; // ✅ Added Axios
import Constants from "expo-constants";
import { auth } from '../../config/firebase'; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth'; 

 const debuggerHost = Constants.expoConfig?.hostUri;
        const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
        const API_URL = `http://${address}:5000`

export default function SignupPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  // State for form fields
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [fullNameTouched, setFullNameTouched] = useState(false);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);

  // --- Validation Logic ---
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
    } else if (!regex.test(value)) {
      setEmailError('Enter a valid email');
    } else {
      setEmailError('');
    }
    setEmail(value);
  };

  const validatePassword = (value: string) => {
    setPassword(value);
    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else if (!/\d/.test(value)) {
      setPasswordError('Password must contain at least 1 number')
    } else {
      setPasswordError('');
    }
  };

  const validateFullName = (value: string) => {
    setFullName(value);
    if (!value.trim()) {
      setFullNameError('Full name is required');
    } else {
      setFullNameError('');
    }
  };

  const validateUsername = (value: string) => {
    setUsername(value);
    if (!value.trim()) {
      setUsernameError('Username is required');
    } else if (value.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else {
      setUsernameError('');
    }
  };

  const handleSignup = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setFullNameTouched(true);
    setUsernameTouched(true);

    if (!email || !password || emailError || passwordError || fullNameError || usernameError) {
      Alert.alert("Error", "Please fix the errors in the form.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update the Firebase Profile with Username
      await updateProfile(user, { displayName: username });

      // 3. Create the user in your MongoDB via Node.js Backend 
      await axios.post(`${API_URL}/api/users`, {
        firebaseUid: user.uid,
        username: username,
        name: fullName,
      });

      // 4. Send verification link
      await sendEmailVerification(user);

      // 5. Sign out so they aren't auto-logged in without verifying
      await signOut(auth);

      setIsLoading(false); 
      
      Alert.alert(
        "Verify Your Email", 
        `An activation link has been sent to ${email}. Please check your inbox and verify your account before logging in.`,
        [{ text: "OK", onPress: () => router.replace('/loginPage') }],
        { cancelable: false } 
      );

    } catch (error: any) {
      setIsLoading(false); 
      console.error("Signup Error:", error.code || error.message);
      
      let errorMessage = "Something went wrong.";
      // Handle Firebase Errors
      if (error.code === 'auth/email-already-in-use') errorMessage = "That email is already in use!";
      else if (error.code === 'auth/invalid-email') errorMessage = "Invalid email format.";
      else if (error.code === 'auth/weak-password') errorMessage = "The password is too weak.";
      // Handle Backend Errors (e.g., Username taken)
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      
      Alert.alert("Signup Error", errorMessage);
    } 
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoiding} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#5f4436' }}>Create Account</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailTouched && emailError ? styles.errorBorder : null]}
              placeholder="Enter email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={validateEmail}
              onBlur={() => setEmailTouched(true)}
            />
            {emailTouched && emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, fullNameTouched && fullNameError ? styles.errorBorder : null]}
              placeholder="Enter full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={validateFullName}
              onBlur={() => setFullNameTouched(true)}
            />
            {fullNameTouched && fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}

            {/* Username */}
            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={[styles.input, usernameTouched && usernameError ? styles.errorBorder : null]}
              placeholder="Enter username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={validateUsername}
              onBlur={() => setUsernameTouched(true)}
            />
            {usernameTouched && usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, passwordTouched && passwordError ? styles.errorBorder : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={validatePassword}
                onBlur={() => setPasswordTouched(true)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </TouchableOpacity>
            </View>
            {passwordTouched && passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.disabledButton]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signupText}>Sign up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Link href="/loginPage" style={styles.link}>
                Already have an account? Log in
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
    paddingTop: 40,              
  },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  card: {
    width: '90%',
    backgroundColor: 'rgba(255, 241, 196, 0.85)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8C28E',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: "#5D4037",
  },
  input: {
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: "#EBEBEB",
    borderRadius: 10,
    height: 45,
    padding: 10,
    marginBottom: 5,
    color: '#333'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: "#EBEBEB",
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  errorBorder: {
    borderColor: '#d9534f',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 11,
    marginBottom: 8,
    marginLeft: 5,
  },
  signupButton: {
    backgroundColor: "#B86D2A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#d1a684",
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#5D4037',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});