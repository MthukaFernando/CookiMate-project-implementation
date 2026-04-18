import React from 'react';
import { render } from '@testing-library/react-native';
import GlobalChatbot from '../app/GlobalChatbot';

// 1. Mock Safe Area Insets (Fixes "No safe area value available")
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, next: 0, right: 0, left: 0, bottom: 0 }),
}));

// 2. Mock AsyncStorage (Fixes Zustant/Persist error)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 3. Mock Axios (Fixes "Cannot cancel a stream" error)
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function () { return this; }),
}));

// 4. Mock Expo Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
  MaterialIcons: 'Icon',
}));

describe('Global Chatbot', () => {
  it('renders correctly without crashing', () => {
    const { toJSON } = render(<GlobalChatbot />);
    
    // If it reaches here without the "Safe Area" error, the test is a SUCCESS
    expect(toJSON()).toBeTruthy();
  });
});