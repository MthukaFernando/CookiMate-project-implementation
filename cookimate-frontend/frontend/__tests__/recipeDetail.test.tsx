import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RecipeDetails from '../app/recipe/[id]'; 

// 1. COMPLETELY MANUALLY MOCK AXIOS (Fixes all Stream/Adapter errors)
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ 
    data: {
      _id: 'recipe_678',
      name: 'Gourmet Pasta',
      totalTime: '25 mins',
      servings: 2,
      ingredients_raw_str: ['100g Pasta'],
      steps: ['Boil water'],
    }
  })),
  defaults: { adapter: {} },
  create: jest.fn().mockReturnThis(),
}));

// 2. MOCK FIREBASE
jest.mock('../config/firebase', () => ({
  auth: { currentUser: { uid: 'test-user-123' } },
  db: {}
}));

// 3. MOCK EXPO ROUTER
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'recipe_678' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

// 4. MOCK EXPO-AV (Audio)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      unloadAsync: jest.fn(),
      playAsync: jest.fn(),
      stopAsync: jest.fn(),
    })),
  },
}));

// 5. MOCK UI COMPONENTS & ASSETS
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-constants', () => ({ expoConfig: { extra: {} } }));
jest.mock('../assets/images/mascot.png', () => 1);

describe('Recipe Details Page Integration Test', () => {
  it('renders the recipe title correctly', async () => {
    const { getByText } = render(<RecipeDetails />);

    // This specifically looks for the name we put in the mock above
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