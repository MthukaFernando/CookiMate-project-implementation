import React, { useEffect, useState, useCallback, memo, useRef } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const auth = getAuth();



const BASE_URL =  `https://cookimate-project-implementation-m4on.onrender.com`;

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
  danger: "#FF4444",
  dangerFaint: "rgba(255,68,68,0.1)",
};


const FanCard = memo(
  ({
    user,
    index,
    currentUserUid,
    onRemove,
  }: {
    user: any;
    index: number;
    currentUserUid: string | undefined;
    onRemove: (followerUid: string) => void;
  }) => {
    const router = useRouter();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;
    const [removing, setRemoving] = useState(false);

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

    const handlePress = () => {
      if (user.firebaseUid) {
        router.push(`/Community/${user.firebaseUid}`);
      }
    };

    const handleRemove = () => {
      Alert.alert(
        "Remove Follower",
        `Remove @${user.username} from your fans?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setRemoving(true);
              try {
                const res = await fetch(`${BASE_URL}/api/users/remove-follower`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    currentUserUid,
                    followerUid: user.firebaseUid,
                  }),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                // Animate out then remove from list
                Animated.parallel([
                  Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                  }),
                  Animated.timing(translateY, {
                    toValue: -10,
                    duration: 250,
                    useNativeDriver: true,
                  }),
                ]).start(() => onRemove(user.firebaseUid));
              } catch (err) {
                setRemoving(false);
                Alert.alert("Error", "Could not remove follower. Try again.");
              }
            },
          },
        ]
      );
    };

    return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.card}
          onPress={handlePress}
        >
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: getAvatar(user.profilePic, user.username) }}
              style={styles.avatar}
              fadeDuration={0}
            />
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.username}>@{user.username}</Text>
            {user.name ? <Text style={styles.name}>{user.name}</Text> : null}
          </View>

          {/* Remove button */}
          <TouchableOpacity
            style={[styles.removeBtn, removing && styles.removeBtnDisabled]}
            onPress={handleRemove}
            disabled={removing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {removing ? (
              <ActivityIndicator size="small" color={theme.danger} />
            ) : (
              <Text style={styles.removeBtnText}>Remove</Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);


const EmptyState = memo(() => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>✦</Text>
    <Text style={styles.emptyTitle}>No fans yet</Text>
    <Text style={styles.emptySubtitle}>
      Share your recipes and start building your audience.
    </Text>
  </View>
));


const Header = memo(({ count }: { count: number }) => (
  <View style={styles.header}>
    <Text style={styles.headerLabel}>FANS</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
));


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
      const url = `${BASE_URL}/api/users/fans/${firebaseUid}`;
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFollowers();
  }, [fetchFollowers]);

  // ✅ Remove fan from local state after successful API call
  const handleRemove = useCallback((followerUid: string) => {
    setFollowers((prev) =>
      prev.filter((f) => f.firebaseUid !== followerUid)
    );
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <FanCard
        user={item}
        index={index}
        currentUserUid={firebaseUid}
        onRemove={handleRemove}
      />
    ),
    [firebaseUid, handleRemove]
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  const ListHeader = useCallback(
    () => <Header count={followers.length} />,
    [followers.length]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={styles.loadingText}>Loading fans…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <FlatList
        data={followers}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.gold}
          />
        }
      />
    </SafeAreaView>
  );
};

export default Fans;


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: theme.muted, fontSize: 13, letterSpacing: 0.5 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 16,
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
  badgeText: { color: theme.gold, fontSize: 11, fontWeight: "600" },
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
  info: { flex: 1, marginLeft: 12 },
  username: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: 0.2,
  },
  name: { fontSize: 13, color: theme.muted, marginTop: 2 },
  removeBtn: {
    backgroundColor: theme.dangerFaint,
    borderWidth: 1,
    borderColor: theme.danger,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
    alignItems: "center",
  },
  removeBtnDisabled: {
    opacity: 0.5,
  },
  removeBtnText: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 8,
  },
  emptyIcon: { fontSize: 32, color: theme.gold, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: theme.text },
  emptySubtitle: {
    fontSize: 14,
    color: theme.muted,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 20,
  },
});
