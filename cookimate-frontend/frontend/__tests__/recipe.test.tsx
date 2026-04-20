import React from 'react';
import { render } from '@testing-library/react-native';
import MyRecipesPage from '../app/details/myRecipes'; 

// ─── Suppress console noise ───────────────────────────────────────────────────
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

// 1. MOCK FIREBASE
jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-123' } })),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// 2. MOCK AXIOS
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { favorites: [] } })), 
  put: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// 3. Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 4. Mock Safe Area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// 5. Mock Expo Router (FIXED VERSION)
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ selectedCategory: 'breakfast', selectedDate: '2024-05-20' }),
  useRouter: () => ({ push: jest.fn(), setParams: jest.fn() }),
  useFocusEffect: jest.fn(), // Just mock it as an empty function
}));

// 6. Mock Icons & Chatbot
jest.mock('@expo/vector-icons', () => ({ 
  Ionicons: ({ name, color, size }: any) => null 
}));
jest.mock('../app/GlobalChatbot', () => 'GlobalChatbot');

describe('My Recipes Page', () => {
  it('renders the search bar and filter dropdowns', () => {
    const { getByPlaceholderText, getByText } = render(<MyRecipesPage />);
    
    // Check if search bar exists
    expect(getByPlaceholderText(/Search recipes/i)).toBeTruthy();
    
    // Check if the "Clear" button exists
    expect(getByText(/Clear/i)).toBeTruthy();
  });
});