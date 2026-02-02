import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyB08oQWo4BJdMjnUc9klvfkcUkLSngic34",
  authDomain: "cookimate-103.firebaseapp.com",
  projectId: "cookimate-103",
  storageBucket: "cookimate-103.firebasestorage.app",
  messagingSenderId: "1034952464978",
  appId: "1:1034952464978:web:97081c3fde876f11d35d8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };