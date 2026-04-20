import React from 'react';
import { render } from '@testing-library/react-native';
import ConverterPage from '../app/details/converterPage';

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

// 1. Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
  Link: 'Link',
}));

// 2. Mock Expo Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
  MaterialIcons: 'Icon',
  FontAwesome: 'Icon',
  AntDesign: 'Icon',
}));

// 3. Mock Safe Area (in case ConverterPage uses it)
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// 4. Mock AsyncStorage (prevents Zustand/persist warnings)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Unit Converter Feature', () => {
  it('renders the converter category screen', () => {
    const { getByText } = render(<ConverterPage />);
    expect(getByText(/CHOOSE CATEGORY/i)).toBeTruthy();
  });

  it('shows the Weight category option', () => {
    const { getByText } = render(<ConverterPage />);
    expect(getByText(/WEIGHT/i)).toBeTruthy();
  });
});
