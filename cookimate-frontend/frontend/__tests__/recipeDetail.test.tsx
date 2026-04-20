import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RecipeDetails from '../app/recipe/[id]';

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

// 1. Mock Axios (full mock — prevents stream / adapter / cancel errors)
jest.mock('axios', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        _id: 'recipe_678',
        name: 'Gourmet Pasta',
        totalTime: '25 mins',
        servings: 2,
        ingredients_raw_str: ['100g Pasta'],
        steps: ['Boil water'],
      },
    })
  ),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function () { return this; }),
  defaults: { adapter: {} },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  CancelToken: {
    source: jest.fn(() => ({ token: {}, cancel: jest.fn() })),
  },
  isCancel: jest.fn(() => false),
}));

// 2. Mock Firebase config
jest.mock('../config/firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123' } },
  db: {},
}));

// 3. Mock Firebase auth module
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user-123' } })),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((_auth: any, cb: (user: { uid: string }) => void) => {
    cb({ uid: 'test-user-123' });
    return jest.fn();
  }),
}));

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));

// 4. Mock Firestore (prevents "No Firebase App" errors)
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
}));

// 5. Mock Expo Router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'recipe_678' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  useFocusEffect: jest.fn((cb: () => void) => { cb(); }),
  Link: 'Link',
}));

// 6. Mock expo-av (Audio)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
      playAsync: jest.fn(() => Promise.resolve()),
      stopAsync: jest.fn(() => Promise.resolve()),
      setOnPlaybackStatusUpdate: jest.fn(),
    })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

// 7. Mock UI components & assets
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  FontAwesome: () => null,
}));

jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-constants', () => ({ expoConfig: { extra: {} } }));

// 8. Mock static assets
jest.mock('../assets/images/mascot.png', () => 1);

// 9. Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Recipe Details Page Integration Test', () => {
  it('renders the recipe title correctly', async () => {
    const { getByText } = render(<RecipeDetails />);

    await waitFor(() => {
      expect(getByText('Gourmet Pasta')).toBeTruthy();
    });
  });

  it('verifies the action button is present', async () => {
    const { getByText } = render(<RecipeDetails />);

    await waitFor(() => {
      expect(getByText(/Start Cooking/i)).toBeTruthy();
    });
  });
});
