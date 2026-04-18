import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginPage from '../app/(auth)/loginPage';

// 1. MOCK FIREBASE COMPLETELY (This stops the "Unexpected token" error)
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  signOut: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

// 2. Mock other dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  Link: 'Link',
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Login Page', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginPage />);
    
    // This now matches "Log in" from your UI
    expect(getByText(/Log in/i)).toBeTruthy();
    
    // Also check for the Welcome message we saw in the logs
    expect(getByText(/Welcome Back/i)).toBeTruthy();
  });
});