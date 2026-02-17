import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import { globalStyle } from './globalStyleSheet.style';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

/* ---------------- TYPES ---------------- */
type StatCardProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
};

type BadgeProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  onPress?: () => void;
};

/* ---------------- MAIN SCREEN ---------------- */
const ProfilePage = () => {
  return (
    <View style={globalStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={require('../assets/images/profile.jpg')}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Jane Doe</Text>
            <Text style={styles.username}>@ChefJane</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => alert('Edit Profile clicked')}
              >
                <Text style={styles.smallBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => alert('Settings clicked')}
              >
                <Text style={styles.smallBtnText}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Points: 1250</Text>
              <Text style={styles.progressText}>750 to next level</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="coffee"
            label="Recipes Cooked"
            onPress={() => alert('Recipes Cooked clicked')}
          />
          <StatCard
            icon="heart"
            label="Favourites"
            onPress={() => alert('Favourites clicked')}
          />
          <StatCard
            icon="award"
            label="Level"
            onPress={() => alert('Level clicked')}
          />
          <StatCard
            icon="users"
            label="Followers"
            onPress={() => alert('Followers clicked')}
          />
        </View>

        {/* Achievements */}
        <View style={styles.achievementBox}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgeRow}>
            <Badge
              icon="butterfly"
              text="Social Butterfly"
              onPress={() => alert('Social Butterfly clicked')}
            />
            <Badge
              icon="silverware-fork-knife"
              text="Master Chef"
              onPress={() => alert('Master Chef clicked')}
            />
            <Badge
              icon="leaf"
              text="First Recipe"
              onPress={() => alert('First Recipe clicked')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;

/* ---------------- SMALL COMPONENTS ---------------- */
const StatCard = ({ icon, label, onPress }: StatCardProps) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress}>
    <Feather name={icon} size={28} color="#333" />
    <Text style={styles.statText}>{label}</Text>
  </TouchableOpacity>
);

const Badge = ({ icon, text, onPress }: BadgeProps) => (
  <TouchableOpacity style={styles.badge} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={28} color="#333" />
    <Text style={styles.badgeText}>{text}</Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6C3A0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#dfb389',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    gap: 15,
    minHeight: 150, // increased height
    alignItems: 'center',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  username: {
    fontSize: 14,
    color: '#555',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },

  smallBtn: {
    backgroundColor: '#f8f0de',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },

  smallBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  progressText: {
    fontSize: 12,
  },

  progressBar: {
    height: 8,
    backgroundColor: '#F3E5D6',
    borderRadius: 6,
    marginTop: 6,
  },

  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#923d0a',
    borderRadius: 6,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 20,
    gap: 15,
  },

  statCard: {
    width: '47%',
    backgroundColor: '#dfb389',
    borderRadius: 20,
    padding: 25, // increased padding for taller card
    alignItems: 'center',
    gap: 12,
    minHeight: 120, // minimum height increased
  },

  statText: {
    fontSize: 14,
    fontWeight: '500',
  },

  achievementBox: {
    backgroundColor: '#dfb389',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  badge: {
    backgroundColor: '#f8f0de',
    borderRadius: 16,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    gap: 8,
    minHeight: 90, // increased height
  },

  badgeText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
