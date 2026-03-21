// jest.setup.js
require("@testing-library/jest-native/extend-expect");

// Mock react-native
jest.mock("react-native", () => ({
    Text: "Text",
    View: "View",
    StyleSheet: {
        create: (styles) => styles
    },
    useColorScheme: () => "light"
}));

// Mock the theme color hook
jest.mock("@/hooks/use-theme-color", () => ({
    useThemeColor: (props, colorName) => {
        return "#000000";
    }
}));

// Mock expo modules completely
jest.mock("expo", () => ({
    Constants: {
        manifest: {},
        expoConfig: {},
        nativeConfig: {},
        platform: { ios: false, android: true },
        isDevice: true
    },
    Asset: {
        loadAsync: jest.fn().mockResolvedValue()
    },
    Font: {
        loadAsync: jest.fn().mockResolvedValue(),
        isLoaded: jest.fn(() => true)
    },
    registerRootComponent: (component) => component
}));

// Mock expo-router
jest.mock("expo-router", () => ({
    Link: ({ children }) => children,
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn()
    },
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn()
    }),
    usePathname: () => "/",
    useSegments: () => [],
    useLocalSearchParams: () => ({})
}));

// Mock expo-asset
jest.mock("expo-asset", () => ({
    Asset: {
        loadAsync: jest.fn().mockResolvedValue(),
        fromModule: jest.fn(() => ({ uri: "mock-uri" }))
    }
}));

// Mock expo-font
jest.mock("expo-font", () => ({
    loadAsync: jest.fn().mockResolvedValue(),
    isLoaded: jest.fn(() => true),
    Font: {}
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
    preventAutoHideAsync: jest.fn().mockResolvedValue(),
    hideAsync: jest.fn().mockResolvedValue()
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
    createURL: jest.fn(() => "mock-url"),
    useURL: jest.fn()
}));

// Mock any other expo modules
jest.mock("expo-status-bar", () => ({
    StatusBar: () => null
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
    Ionicons: "Ionicons",
    MaterialIcons: "MaterialIcons",
    Feather: "Feather"
}));

// Silence console logs during tests (optional)
global.console = {
    ...console,
    // Uncomment to silence specific logs
    // log: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};
