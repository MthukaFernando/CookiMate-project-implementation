import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Modal
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";


const { width } = Dimensions.get("window");

const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;

const LevelsPage = () => {
  const router = useRouter();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  

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
        <ActivityIndicator size="large" color="#f17501" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color='#fff200'/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cooking Levels</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollList} 
        showsVerticalScrollIndicator={false}
      >
        {levels.map((lvl: any) => (
          <LevelCard 
            key={lvl.levelNumber} 
            level={lvl} 
            onOpenReqs={() => {
              setSelectedLevel(lvl);
              setModalVisible(true);
            }}
          />
        ))}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{selectedLevel?.levelName} Tasks</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedLevel && Object.entries(selectedLevel.requirements).map(([key, value]) => {
                if (value === 0) return null;
                return (
                  <View key={key} style={styles.requirementRow}>
                    <Feather name="check-circle" size={18} color="#ff9500" />
                    <Text style={styles.requirementText} numberOfLines={1}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value as number}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const LevelCard = ({ level, onOpenReqs }: any) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardLevelName}>{level.levelName}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {level.badge?.description || `Unlock this rank at ${level.minPoints} XP`}
        </Text>
        
        <TouchableOpacity 
          style={styles.actionBtn} 
          activeOpacity={0.8}
          onPress={onOpenReqs}
        >
          <Text style={styles.actionBtnText} numberOfLines={1}>Requirements</Text>
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
    backgroundColor: "#0A0A0A" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f2ece2" 
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
    color: '#fff200',
    letterSpacing: 0.5
  },
  scrollList: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  cardContainer: {
    backgroundColor: '#1b1b1b',
    borderColor: '#1A1A1A',
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
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fbffc7',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    padding: 25,
    maxHeight: '70%',
    elevation: 20
  },
  closeModalBtn: {
    alignSelf: 'flex-end',
    padding: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center'
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fffd8b',
    gap: 12
  },
  requirementText: {
    fontSize: 16,
    color: '#ffffff',
    textTransform: 'capitalize'
  },
});

export default LevelsPage;