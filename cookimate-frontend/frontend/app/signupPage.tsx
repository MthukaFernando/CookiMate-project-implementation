import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; // Import Icons

import { auth } from '../config/firebase'; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'; 

export default function SignupPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Visibility State

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username
      });

      // Send the verification email
      await sendEmailVerification(user);
      setIsLoading(false); 
      Alert.alert(
        "Verify Your Email", 
        `An activation link has been sent to ${email}. Please check your inbox (and spam folder) to verify your account before logging in.`,
        [
          { 
            text: "OK", 
            onPress: () => router.replace('/loginPage') 
          }
        ],
        { cancelable: false } 
      );

    } catch (error: any) {
      setIsLoading(false); 
      console.error(error.code);
      let errorMessage = "Something went wrong.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "That email is already in use!";
      else if (error.code === 'auth/invalid-email') errorMessage = "Invalid email format.";
      else if (error.code === 'auth/weak-password') errorMessage = "The password is too weak.";
      
      Alert.alert("Signup Error", errorMessage);
    } 
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

            <Link href="/loginPage" style={styles.loginLink}>
              Already have an account? Log in
            </Link>

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
    marginBottom: 5,
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
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: "#5f4436e6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "#5f443699",
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 15,
    color: 'black',
    fontSize: 14,
  }
});