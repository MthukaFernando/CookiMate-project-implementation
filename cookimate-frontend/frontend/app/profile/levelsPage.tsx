import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

const LevelsPage = () => {
  const router = useRouter();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/gamification/levels`);
        setLevels(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#5F4436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cooking Levels</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollList} 
        showsVerticalScrollIndicator={false}
      >
        {levels.map((lvl: any) => (
          <LevelCard key={lvl.levelNumber} level={lvl} />
        ))}
      </ScrollView>
    </View>
  );
};

const LevelCard = ({ level }: any) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardLevelName}>{level.levelName}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {level.badge?.description || `Unlock this rank at ${level.minPoints} XP`}
        </Text>
        
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>Requirements</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRight}>
        <Image 
          source={{ uri: level.badge?.imageUrl }} 
          style={styles.characterImg}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f2ece2" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#4834d4" 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#5F4436',
    letterSpacing: 0.5
  },
  scrollList: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 160,
    flexDirection: 'row',
    marginBottom: 30,
    paddingLeft: 25,
    paddingRight: 10,
    paddingVertical: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardLeft: {
    flex: 1.4,
    justifyContent: 'center',
    zIndex: 2,
  },
  cardLevelName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2d3436',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#446305',
    marginBottom: 15,
    lineHeight: 18,
    width: '90%',
  },
  actionBtn: {
    backgroundColor: '#eb9f49', 
    paddingVertical: 8,      
    paddingHorizontal: 12,  
    borderRadius: 25,
    alignSelf: 'flex-start',
    elevation: 3,
    flexWrap: 'nowrap',      
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,            
    letterSpacing: 0.5,    
  },
  cardRight: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImg: {
    width: 150,
    height: 150,
    position: 'absolute',
    bottom: -15, 
    right: -10,  
    zIndex: 1,
  },
});

export default LevelsPage;