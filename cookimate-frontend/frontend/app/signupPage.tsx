import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function SignupPage() {

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

  // Email validation
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

  // Password validation
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

  // Full Name validation
  const validateFullName = (value: string) => {
    setFullName(value);
    if (!value.trim()) {
      setFullNameError('Full name is required');
    } else {
      setFullNameError('');
    }
  };

  // Username validation
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

  // Handle Sign in button press
  const handleSignup = () => {
    // Mark all fields as touched
    setEmailTouched(true);
    setPasswordTouched(true);
    setFullNameTouched(true);
    setUsernameTouched(true);

    // Validate all fields
    validateEmail(email);
    validatePassword(password);
    validateFullName(fullName);
    validateUsername(username);

    if (emailError || passwordError || fullNameError || usernameError) return;

    // If all valid
    console.log('Form is valid');
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
            style={[styles.input, emailTouched && emailError ? { borderColor: 'red' } : null]}
            placeholder="Enter email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={validateEmail}
            onBlur={() => setEmailTouched(true)}
          />
          {emailTouched && emailError ? (
            <Text style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>{emailError}</Text>
          ) : null}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, fullNameTouched && fullNameError ? { borderColor: 'red' } : null]}
            placeholder="Enter full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={validateFullName}
            onBlur={() => setFullNameTouched(true)}
          />
          {fullNameTouched && fullNameError ? (
            <Text style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>{fullNameError}</Text>
          ) : null}

          {/* Username */}
          <Text style={styles.label}>User Name</Text>
          <TextInput
            style={[styles.input, usernameTouched && usernameError ? { borderColor: 'red' } : null]}
            placeholder="Enter username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={validateUsername}
            onBlur={() => setUsernameTouched(true)}
          />
          {usernameTouched && usernameError ? (
            <Text style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>{usernameError}</Text>
          ) : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, passwordTouched && passwordError ? { borderColor: 'red' } : null]}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={validatePassword}
            onBlur={() => setPasswordTouched(true)}
          />
          {passwordTouched && passwordError ? (
            <Text style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>{passwordError}</Text>
          ) : null}

          {/* Sign in button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupText}>Sign in</Text>
          </TouchableOpacity>

        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    marginBottom: 20,
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
  homeLink: {
    color: 'gray',
    fontSize: 14,
    marginTop: 10,
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
    marginBottom: 15,
  },
  signupButton: {
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

  signupText: {
    color: "#fff",
    fontSize: 13,
  },
});
