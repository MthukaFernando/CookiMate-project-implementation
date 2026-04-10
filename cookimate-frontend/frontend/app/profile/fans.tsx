import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
} from "react-native";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

const auth = getAuth();

// ✅ Dynamic BASE_URL — reads the IP Expo is already using, no manual changes needed
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // strips Expo port, keeps IP
    return `http://${host}:5000`;
  }
  return "http://10.0.2.2:5000"; // Android emulator fallback
};

const BASE_URL = getBaseUrl();

// ✅ Avatar fallback — handles null/undefined profilePic
const getAvatar = (profilePic: string | null | undefined, username: string) => {
  if (profilePic && profilePic.startsWith("http")) return profilePic;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username || "U"
  )}&background=D4AF37&color=0A0A0A&bold=true&size=128`;
};

const theme = {
  bg: "#0A0A0A",
  card: "#141414",
  cardBorder: "#2A2A2A",
  gold: "#D4AF37",
  goldFaint: "rgba(212,175,55,0.08)",
  text: "#F5F5F5",
  muted: "#777777",
};

// ── Fan Card ──────────────────────────────────────────────────────────────────
const FanCard = ({ user, index }: { user: any; index: number }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity activeOpacity={0.75} style={styles.card}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: getAvatar(user.profilePic, user.username) }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.username}>@{user.username}</Text>
          {/* name only shows if backend populates it */}
          {user.name ? <Text style={styles.name}>{user.name}</Text> : null}
        </View>

        <View style={styles.dot} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>✦</Text>
    <Text style={styles.emptyTitle}>No fans yet</Text>
    <Text style={styles.emptySubtitle}>
      Share your recipes and start building your audience.
    </Text>
  </View>
);

// ── Header ────────────────────────────────────────────────────────────────────
const Header = ({ count }: { count: number }) => (
  <View style={styles.header}>
    <Text style={styles.headerLabel}>FANS</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const Fans = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = auth.currentUser;
  const firebaseUid = currentUser?.uid;

  const fetchFollowers = useCallback(async () => {
    try {
      if (!firebaseUid) {
        console.warn("No logged-in user found.");
        return;
      }

      // ✅ Fix: use BASE_URL variable — was previously hardcoded to wrong URL with no port
      const url = `${BASE_URL}/api/users/fans/${firebaseUid}`;
      console.log("Fetching from:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFollowers(data.followers || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [firebaseUid]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFollowers();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.gold} />
        <Text style={styles.loadingText}>Loading fans…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={followers}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <FanCard user={item} index={index} />}
        ListHeaderComponent={<Header count={followers.length} />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.gold}
          />
        }
      />
    </View>
  );
};

export default Fans;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.bg,
    gap: 12,
  },
  loadingText: {
    color: theme.muted,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: theme.gold,
  },
  badge: {
    backgroundColor: theme.goldFaint,
    borderWidth: 1,
    borderColor: theme.gold,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: theme.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  avatarWrapper: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: theme.gold,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.cardBorder,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 13,
    color: theme.muted,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.gold,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
    color: theme.gold,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.muted,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 20,
  },
});
