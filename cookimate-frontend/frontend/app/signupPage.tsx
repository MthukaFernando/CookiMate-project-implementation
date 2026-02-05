import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

// Import the auth instance we created in Step 3
import { auth } from '../config/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage() {
  const router = useRouter();

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

  // Email validation with TypeScript type
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

  // Password validation with TypeScript type
  const validatePassword = (value: string) => {
    setPassword(value);
    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  // Full Name validation with TypeScript type
  const validateFullName = (value: string) => {
    setFullName(value);
    if (!value.trim()) {
      setFullNameError('Full name is required');
    } else {
      setFullNameError('');
    }
  };

  // Username validation with TypeScript type
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

  // Handle Sign up button press
  const handleSignup = async () => {
    // Mark all fields as touched to trigger error display
    setEmailTouched(true);
    setPasswordTouched(true);
    setFullNameTouched(true);
    setUsernameTouched(true);

    // Final check for errors
    if (!email || !password || emailError || passwordError || fullNameError || usernameError) {
      Alert.alert("Error", "Please fix the errors in the form.");
      return;
    }

    try {
      // Firebase magic: Creates the user in your console
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User created:', user.email);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace('/loginPage') }
      ]);

    } catch (error: any) {
      // Added ': any' to resolve TypeScript 'error' underlines
      console.error(error.code);
      let errorMessage = "Something went wrong.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "That email is already in use!";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak.";
      }
      
      Alert.alert("Signup Error", errorMessage);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
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
          <TextInput
            style={[styles.input, passwordTouched && passwordError ? styles.errorBorder : null]}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={validatePassword}
            onBlur={() => setPasswordTouched(true)}
          />
          {passwordTouched && passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Signup button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>

          <Link href="/loginPage" style={styles.loginLink}>
            Already have an account? Log in
          </Link>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#fff1c4",
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
    backgroundColor: "white",
    borderColor: "#ffffff",
    borderRadius: 8,
    height: 40,
    padding: 10,
    marginBottom: 5,
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