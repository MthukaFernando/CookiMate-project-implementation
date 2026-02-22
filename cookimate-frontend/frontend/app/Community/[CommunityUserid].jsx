import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SCREEN_PADDING = 20;
const GAP = 5; // Gap between images

// Calculate image size based on available space after horizontal padding
const AVAILABLE_WIDTH = width - (SCREEN_PADDING * 2);
const IMAGE_SIZE = (AVAILABLE_WIDTH - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function CommunityUserProfile() {
  const { CommunityUserid } = useLocalSearchParams();
  const router = useRouter();

  const user = {
    name: CommunityUserid || "Guest Cook",
    handle: `@${CommunityUserid?.toString().toLowerCase().replace(/\s/g, '') || 'user'}`,
    bio: "Passionate home cook! 🍳 | Dessert Lover 🍰 | Sharing healthy & easy recipes every week.",
    stats: { recipes: 24, followers: "1.2k", following: 150 },
    posts: [
      { id: '1', uri: 'https://www.halfbakedharvest.com/wp-content/uploads/2024/04/30-Minute-Honey-Garlic-Chicken-1.jpg' },
      { id: '2', uri: 'https://www.eatingwell.com/thmb/S2NGMEcgm11dtdBJ6Hwprwq-nVk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/eat-the-rainbow-chopped-salad-with-basil-mozzarella-beauty-185-278133-4000x2700-56879ac756cd46ea97944768847b7ea5.jpg' },
      { id: '3', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9TF3SqH4Bd9ubQzSBzTES6w1zoMH6-3nR9w&s' },
      { id: '4', uri: 'https://hips.hearstapps.com/hmg-prod/images/chocolate-pie-cookies-lead-66fc19fe1abd1.jpg?crop=0.6666666666666667xw:1xh;center,top' },
      { id: '5', uri: 'https://www.happyfoodstube.com/wp-content/uploads/2018/08/raspberry-oreo-no-bake-dessert-image-500x500.jpg' },
      { id: '6', uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM6wseYxMw4o2bGtI1H54AT903NIK3BgTMJQ&s' },
    ]
  };

  const ProfileHeader = () => (
    <View style={styles.headerWrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#5F4436" />
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <View style={styles.avatarBorder}>
          <Image 
            source={{ uri: "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg" }} 
            style={styles.profileAvatar}
          />
        </View>

        <Text style={styles.userNameText}>{user.name}</Text>
        <Text style={styles.handleText}>{user.handle}</Text>
        
        <View style={styles.badgeContainer}>
           <Text style={styles.idText}>ID: {CommunityUserid}</Text>
        </View>

        <Text style={styles.bioText}>{user.bio}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.recipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={user.posts}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9}>
            <Image source={{ uri: item.uri }} style={styles.postImage} />
          </TouchableOpacity>
        )}
      />      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F5F2',
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 20,
  },
  headerWrapper: {
    paddingBottom: 10,
  },
  backBtn: {
    marginTop: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileCard: {
    backgroundColor: 'white',
    marginTop: 15,
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5F4436',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E8C28E',
    marginBottom: 10,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D2D2D',
  },
  handleText: {
    color: '#B86D2A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  badgeContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  idText: {
    fontSize: 10,
    color: '#888',
    fontWeight: 'bold',
  },
  bioText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#612D25',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  followButton: {
    backgroundColor: '#522F2F',
    paddingVertical: 14,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: GAP,
    marginBottom: GAP,
  },
  postImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
});