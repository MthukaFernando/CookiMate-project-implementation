import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { globalStyle } from '../globalStyleSheet.style';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={globalStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Notifications */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={22} color="#333" />
              <Text style={styles.rowText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor="#923d0a"
              trackColor={{ false: '#e5d3bd', true: '#c99a6a' }}
            />
          </View>
        </View>

        {/* Dietary Preferences */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => alert('Navigate to Dietary Preferences')}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="food-apple"
                size={22}
                color="#333"
              />
              <Text style={styles.rowText}>Dietary Preferences</Text>
            </View>
            <Feather name="chevron-right" size={22} color="#333" />
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Alert.alert('Log Out', 'Are you sure you want to log out?')
          }
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="log-out" size={22} color="#333" />
              <Text style={styles.rowText}>Log Out</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={[styles.card, styles.dangerCard]}
          onPress={() =>
            Alert.alert(
              'Delete Account',
              'This action is permanent. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' },
              ]
            )
          }
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="trash-2" size={22} color="#7a1f1f" />
              <Text style={[styles.rowText, styles.dangerText]}>
                Delete Account
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsPage;

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },

  card: {
    backgroundColor: '#dfb389',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },

  dangerCard: {
    backgroundColor: '#f3d6d3',
  },

  dangerText: {
    color: '#7a1f1f',
    fontWeight: '600',
  },
});
