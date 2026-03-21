// jest.setup.js
// Mock the problematic Expo modules
jest.mock('expo', () => ({
    Constants: {
        manifest: {},
        expoConfig: {},
        nativeConfig: {},
        platform: { ios: false, android: true },
        isDevice: true,
    },
    Asset: {
        loadAsync: jest.fn(),
    },
    Font: {
        loadAsync: jest.fn(),
        isLoaded: jest.fn(() => true),
    },
}));

// Mock expo-router if you're using it
jest.mock('expo-router', () => ({
    Link: ({ children, href }) => children,
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSegments: () => [],
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
    Asset: {
        loadAsync: jest.fn(),
        fromModule: jest.fn(() => ({ uri: 'mock-uri' })),
    },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

// Suppress console logs during tests (optional)
global.console = {
    ...console,
    // Uncomment to silence specific logs
    // log: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};