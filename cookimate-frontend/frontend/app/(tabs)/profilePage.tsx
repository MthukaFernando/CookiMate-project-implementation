import React, { useState, useCallback } from "react";
import { auth } from "../../config/firebase";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { globalStyle } from "../globalStyleSheet.style";
import Constants from "expo-constants";

 const debuggerHost = Constants.expoConfig?.hostUri;
        const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
        const API_URL = `http://${address}:5000`
const DEFAULT_AVATAR = "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid; 

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${uid}`);
      setUser(response.data);
    } catch (err: any) {
      console.error("Fetch error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#923d0a" />
      </View>
    );
  }

  return (
    <ScrollView style={[globalStyle.container,styles.scrollContent]}>
     
      
        
        {/* 1. TOP PROFILE CARD (The Header) */}
        <View style={styles.topSubContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.mascotCircle}>
              <Image
                source={{ uri: user?.profilePic || DEFAULT_AVATAR }}
                style={styles.mascotImg}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.nameText}>{user?.name}</Text>
              <Text style={styles.usernameText}>@{user?.username}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => router.push("/profile/editprofile")}
                >
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsBtn}>
                  <Feather name="settings" size={18} color="#5F4436" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
             <View style={styles.levelLabelRow}>
                <Text style={styles.levelLabel}>Level {user?.level || 1}</Text>
                <Text style={styles.pointsLabel}>{user?.points || 0} XP</Text>
             </View>
             <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(user?.points % 100) || 20}%` }]} />
             </View>
          </View>
        </View>

        {/* 2. STATS SECTION (3D White Cards) */}
        <View style={styles.bottomSubContainer}>
        <Text style={styles.sectionTitle}>Cooking Journey</Text>
        <View style={styles.statsGrid}>
           <StatItem 
              icon="coffee" 
              label="Cooked" 
              value={user?.recipesCookedCount || 0} 
              bColor="#c3924e" 
              onPress={() => console.log("Route to Cooked List")}
           />
           <StatItem 
              icon="heart" 
              label="Favs" 
              value={user?.favorites?.length || 0} 
              bColor="#B86D2A" 
              onPress={() => console.log("Route to Favorites")}
           />
           <StatItem 
              icon="award" 
              label="Levels" 
              value={user?.level || 1} 
              bColor="#612D25" 
              onPress={() => console.log("Route to Ranks")}
           />
           <StatItem 
              icon="users" 
              label="Fans" 
              value={user?.followers || 0} 
              bColor="#923d0a" 
              onPress={() => console.log("Route to Followers")}
           />
        </View>
      </View>

        {/* 3. ACHIEVEMENTS (Horizontally Scrollable) */}
        <View style={styles.bottomSubContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.badgeScroll}
          >
            <BadgeItem 
  imageUrl="https://res.cloudinary.com/cookimate-images/image/upload/v1770965619/profile_pic1_plo6pj.png" 
  title="Social" 
/>
          </ScrollView>
        </View>
        
      </ScrollView>
    
  );
};

/* --- SUB-COMPONENTS --- */

const StatItem = ({ icon, label, value, bColor, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.4}
    style={[styles.statCard, { borderColor: bColor, borderBottomColor: bColor }]} 
    onPress={onPress}
  >
    <View style={styles.statIconCircle}>
      <Feather name={icon} size={18} color="#5F4436" />
    </View>
    <View style={styles.statTextColumn}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  </TouchableOpacity>
);
const BadgeItem = ({ imageUrl, title }: { imageUrl: string, title: string }) => (
  <View style={styles.badgeCard}>
    <View style={styles.badgeIconCircle}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.badgeImage} 
        resizeMode="contain"
      />
    </View>
    <Text style={styles.badgeTitle}>{title}</Text>
  </View>
);

/* --- STYLES --- */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2ece2" },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
  backBtn: { marginHorizontal: 25, marginTop: 10, width: 40, height: 40, justifyContent: 'center' },
  badgeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#f8f0de',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8C28E',
    overflow: 'hidden', // ✅ Important: Clips the image to the border radius
  },
  badgeImage: {
    width: '75%', // Leaves a little "breathing room" inside the circle
    height: '75%',
  },
  badgeTitle: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#5D4037',
    textAlign: 'center' 
  },

  // Top Mascot-style Container
  topSubContainer: {
    backgroundColor: '#E0C2A0',
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0871f45",
    elevation: 4,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  mascotCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#EBEBEB',
    overflow: 'hidden'
  },
  mascotImg: { width: '100%', height: '100%' },
  headerTextContainer: { flex: 1 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  usernameText: { fontSize: 14, color: '#5D4037', marginBottom: 10 },
  
  actionRow: { flexDirection: 'row', gap: 10 },
  editBtn: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 12,
    elevation: 2 
  },
  editBtnText: { fontSize: 12, fontWeight: 'bold', color: '#5D4037' },
  settingsBtn: { 
    backgroundColor: '#fff', 
    width: 35, 
    height: 35, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2 
  },

  // Level Bar
  levelContainer: { marginTop: 20 },
  levelLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  levelLabel: { fontWeight: 'bold', color: '#5D4037' },
  pointsLabel: { fontSize: 12, color: '#5D4037' },
  progressBar: { height: 10, backgroundColor: '#fff', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#923d0a' },

  // Bottom 3D Cards
  bottomSubContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#E8C28E',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#5D4037', marginBottom: 15 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  statCard: {
   width: '48%',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#eee8dd', // Your requested color
  padding: 12,
  borderRadius: 18,
  borderWidth: 1.5,
  borderBottomWidth: 5, 
  gap: 0,
  
  
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  
  // Elevation for Android
  elevation: 6,
  },
  statTextColumn: { flex: 1, marginLeft: 8 },
  statIconCircle: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 14, color: '#777' },

  // Achievements Scroll
  badgeScroll: { gap: 15, paddingRight: 10 },
  badgeCard: { alignItems: 'center', width: 80 },
  
  
});

export default ProfilePage;