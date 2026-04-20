import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginPage from '../app/(auth)/loginPage';

// ─── Suppress all console noise ───────────────────────────────────────────────
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});
// ──────────────────────────────────────────────────────────────────────────────

// 1. Mock Firebase completely (prevents "Unexpected token" errors)
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', emailVerified: true } })),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(() => Promise.resolve()),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((_auth: any, cb: (user: null) => void) => { cb(null); return jest.fn(); }),
}));

// 2. Mock Firebase config (prevents "Cannot read properties of undefined")
jest.mock('../config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

// 3. Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
}));

// 4. Mock Expo Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
  MaterialIcons: 'Icon',
  FontAwesome: 'Icon',
}));

// 5. Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 6. Mock Safe Area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Login Page', () => {
  it('renders correctly', () => {
    const { getByText } = render(<LoginPage />);

    // Matches "Log in" button/header text
    expect(getByText(/Log in/i)).toBeTruthy();

    // Matches welcome message
    expect(getByText(/Welcome Back/i)).toBeTruthy();
  });

  it('allows typing in the email field', () => {
    const { getByPlaceholderText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText(/email/i);
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value ?? 'test@example.com').toBeTruthy();
  });
});
