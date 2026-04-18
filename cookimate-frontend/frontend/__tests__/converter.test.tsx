import React from 'react';
import { render } from '@testing-library/react-native';
import ConverterPage from '../app/details/converterPage';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon', MaterialIcons: 'Icon' }));

describe('Unit Converter Feature', () => {
  it('renders the converter category screen', () => {
    const { getByText } = render(<ConverterPage />);
    // This matches the "CHOOSE CATEGORY" text we saw in your terminal log
    expect(getByText(/CHOOSE CATEGORY/i)).toBeTruthy();
  });

  it('shows the Weight category option', () => {
    const { getByText } = render(<ConverterPage />);
    expect(getByText(/WEIGHT/i)).toBeTruthy();
  });
});